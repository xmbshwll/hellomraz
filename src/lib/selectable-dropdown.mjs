import { createFloatingDropdown } from './floating-dropdown.mjs';

/**
 * @typedef {{
 *   id: string;
 *   label?: string;
 *   divider?: boolean;
 * }} SelectableDropdownOption
 *
 * @typedef {{
 *   readyFlag: string;
 *   buttonId: string;
 *   labelId: string;
 *   arrowId: string;
 *   panelId: string;
 *   width: number;
 *   align?: 'start' | 'end';
 *   useOverlay?: boolean;
 *   maxHeight?: number;
 *   getOptions: () => SelectableDropdownOption[];
 *   getCurrent: () => string;
 *   setCurrent: (value: string) => void;
 *   formatLabel: (value: string) => string;
 *   renderOptionLead?: (option: SelectableDropdownOption) => Node | null;
 *   onInit?: () => void;
 *   onOpen?: (panel: HTMLElement) => void;
 * }} SelectableDropdownConfig
 */

/**
 * @param {SelectableDropdownConfig} config
 */
export function mountSelectableDropdown(config) {
  if (window[config.readyFlag]) return;
  window[config.readyFlag] = true;

  /** @type {HTMLElement | null} */
  let panel = null;

  const getButton = () => document.getElementById(config.buttonId);
  const getLabel = () => document.getElementById(config.labelId);
  const getArrow = () => document.getElementById(config.arrowId);

  function buildPanel() {
    const nextPanel = document.createElement('div');
    nextPanel.id = config.panelId;
    nextPanel.className = 'chooser-dropdown';

    for (const option of config.getOptions()) {
      if (option.divider) {
        const divider = document.createElement('div');
        divider.className = 'chooser-divider';
        nextPanel.appendChild(divider);
        continue;
      }

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chooser-option';
      button.setAttribute('data-option-value', option.id);

      const lead = config.renderOptionLead?.(option);
      if (lead) button.appendChild(lead);

      const label = document.createElement('span');
      label.textContent = option.label ?? option.id;
      button.appendChild(label);

      const check = document.createElement('span');
      check.className = 'chooser-check';
      check.textContent = '✓';
      button.appendChild(check);

      button.addEventListener('click', (event) => {
        event.stopPropagation();
        config.setCurrent(option.id);
        updateSelection();
        floatingDropdown.close();
      });

      nextPanel.appendChild(button);
    }

    return nextPanel;
  }

  function ensurePanel() {
    if (!panel || !panel.isConnected) {
      panel = buildPanel();
    }

    return panel;
  }

  function updateSelection() {
    const current = config.getCurrent();
    const currentPanel = ensurePanel();

    currentPanel.querySelectorAll('.chooser-option').forEach((optionButton) => {
      const active = optionButton.getAttribute('data-option-value') === current;
      optionButton.classList.toggle('is-active', active);
    });

    const label = getLabel();
    if (label) label.textContent = config.formatLabel(current);
  }

  function scrollCurrentOptionIntoView() {
    const current = config.getCurrent();
    const currentPanel = ensurePanel();

    const activeOption = Array.from(
      currentPanel.querySelectorAll('.chooser-option'),
    ).find(
      (optionButton) => optionButton.getAttribute('data-option-value') === current,
    );

    if (activeOption instanceof HTMLElement) {
      activeOption.scrollIntoView({ block: 'nearest' });
    }
  }

  function syncOpenState(open) {
    const button = getButton();
    if (button) button.setAttribute('aria-expanded', open ? 'true' : 'false');

    const arrow = getArrow();
    if (arrow) {
      arrow.style.transform = open ? 'rotate(180deg)' : 'rotate(0deg)';
    }

    if (open) {
      const currentPanel = ensurePanel();
      updateSelection();
      scrollCurrentOptionIntoView();
      config.onOpen?.(currentPanel);
    }
  }

  const floatingDropdown = createFloatingDropdown({
    getAnchor: () => /** @type {HTMLElement | null} */ (getButton()),
    getPanel: ensurePanel,
    useOverlay: config.useOverlay ?? true,
    zIndex: 99999,
    position: {
      align: config.align ?? 'end',
      width: config.width,
      offset: 4,
      viewportPadding: 4,
      maxHeight: config.maxHeight ?? 320,
    },
    setPanelOpen(currentPanel, open) {
      currentPanel.style.opacity = open ? '1' : '0';
      currentPanel.style.pointerEvents = open ? 'auto' : 'none';
    },
    onOpenChange(open) {
      syncOpenState(open);
    },
  });

  function bindButton() {
    const button = getButton();
    if (!button || button.dataset.dropdownBound === 'true') return;

    button.dataset.dropdownBound = 'true';
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      floatingDropdown.toggle();
    });
  }

  function init() {
    bindButton();
    updateSelection();
    syncOpenState(floatingDropdown.isOpen());
    config.onInit?.();
  }

  document.addEventListener('astro:page-load', init);
  init();
}
