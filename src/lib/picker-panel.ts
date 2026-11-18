/**
 * Shared plumbing for the header pickers (tag picker, geo search): the panel
 * controller with its positioning options, a cached JSON loader, and the row
 * markup used by both lists. Each picker keeps its own list logic.
 */
import { createFloatingDropdown } from './floating-dropdown.mjs';
import { navigateInternal } from './navigate';

interface PickerPanelOptions {
  button: HTMLButtonElement;
  arrow: HTMLElement;
  getPanel: () => HTMLElement | null;
}

export interface PickerPanelDom {
  panel: HTMLDivElement;
  searchInput: HTMLInputElement;
  listEl: HTMLDivElement;
}

/**
 * Panel skeleton: dropdown, optional search field and list. Callers add rows.
 * Without a search field the input is detached, so nothing focuses it.
 */
export function createPickerPanelDom(placeholder: string, withSearch = true): PickerPanelDom {
  const panel = document.createElement('div');
  panel.className = 'picker-dropdown';
  panel.hidden = true;

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'picker-search';
  searchInput.placeholder = placeholder;
  searchInput.autocomplete = 'off';
  if (withSearch) {
    const searchWrap = document.createElement('div');
    searchWrap.className = 'picker-search-wrap';
    searchWrap.appendChild(searchInput);
    panel.appendChild(searchWrap);
  }

  const listEl = document.createElement('div');
  listEl.className = 'picker-list';
  panel.appendChild(listEl);

  return { panel, searchInput, listEl };
}

/** Footer entry at the bottom of a picker panel; closes the panel, then navigates. */
export function createPickerFooter(href: string, label: string, close: () => void): HTMLAnchorElement {
  const link = document.createElement('a');
  link.className = 'picker-more';
  link.href = href;
  link.textContent = label;
  link.addEventListener('click', (event) => {
    event.preventDefault();
    // The panel may be re-rendered on click, so stop before the dropdown sees a
    // detached target and closes itself twice.
    event.stopPropagation();
    close();
    navigateInternal(link.href);
  });
  return link;
}

/** Dropdown controller with the shared panel geometry and search behaviour. */
export function createPickerPanel({ button, arrow, getPanel }: PickerPanelOptions) {
  return createFloatingDropdown({
    getAnchor: () => button,
    getPanel,
    useOverlay: true,
    zIndex: 99999,
    position: {
      align: 'start',
      width: 280,
      offset: 4,
      viewportPadding: 4,
      maxHeight: 400,
    },
    onOpenChange(open, panel) {
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      arrow.classList.toggle('is-open', open);

      if (!open || !panel) return;
      const input = panel.querySelector('.picker-search') as HTMLInputElement | null;
      if (!input) return;
      input.value = '';
      input.dispatchEvent(new Event('input'));
      requestAnimationFrame(() => input.focus());
    },
  });
}

/** Cached GET of a JSON array, shared across picker instances. */
export function loadJsonCached<Item>(
  cache: Map<string, Promise<Item[]>>,
  url: string,
): Promise<Item[]> {
  const cached = cache.get(url);
  if (cached) return cached;
  const request = fetch(url)
    .then(async (response) => {
      if (!response.ok) throw new Error(`Failed to load ${url}`);
      return (await response.json()) as Item[];
    })
    .catch(() => [] as Item[]);
  cache.set(url, request);
  return request;
}

export interface PickerRow {
  href: string;
  name: string;
  /** Second line, for example the country of a city. */
  meta?: string;
  count?: number | string;
  /** Show a chevron: the row drills into another level instead of navigating. */
  drill?: boolean;
}

export interface PickerCrumbs {
  el: HTMLDivElement;
  /** Trail of the current level; an empty trail hides the row. */
  setTrail(labels: string[]): void;
}

/**
 * Breadcrumb row for a drilled panel. `onSelect(0)` goes back to the root
 * level, `onSelect(n)` to the level whose label is at index `n - 1`.
 */
export function createPickerCrumbs(
  rootLabel: string | (() => string),
  onSelect: (depth: number) => void,
): PickerCrumbs {
  const el = document.createElement('div');
  el.className = 'picker-crumbs';
  el.hidden = true;

  function crumbButton(label: string, depth: number): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'picker-crumb';
    button.textContent = label;
    button.addEventListener('click', (event) => {
      // The row is rebuilt on selection, so keep the click from reaching the
      // dropdown, which would otherwise close on a detached target.
      event.stopPropagation();
      onSelect(depth);
    });
    return button;
  }

  return {
    el,
    setTrail(labels) {
      el.hidden = labels.length === 0;
      el.innerHTML = '';
      if (labels.length === 0) return;

      const label = typeof rootLabel === 'function' ? rootLabel() : rootLabel;
      el.appendChild(crumbButton(`← ${label}`, 0));
      labels.forEach((label, index) => {
        const separator = document.createElement('span');
        separator.textContent = '/';
        el.appendChild(separator);

        const isLast = index === labels.length - 1;
        if (isLast) {
          const current = document.createElement('span');
          current.className = 'picker-crumb picker-crumb--current';
          current.textContent = label;
          el.appendChild(current);
          return;
        }
        el.appendChild(crumbButton(label, index + 1));
      });
    },
  };
}

/** One `.picker-item` row; the caller binds the click behaviour. */
export function createPickerRow({
  href,
  name,
  meta,
  count,
  drill = false,
}: PickerRow): HTMLAnchorElement {
  const link = document.createElement('a');
  link.href = href;
  link.className = 'picker-item';

  const label = document.createElement('span');
  label.className = 'picker-item__label';
  const nameEl = document.createElement('span');
  nameEl.className = 'picker-item__name';
  nameEl.textContent = name;
  label.appendChild(nameEl);
  if (meta) {
    const metaEl = document.createElement('span');
    metaEl.className = 'picker-item__meta';
    metaEl.textContent = meta;
    label.appendChild(metaEl);
  }
  link.appendChild(label);

  if (count !== undefined) {
    const countEl = document.createElement('span');
    countEl.className = 'picker-item__count';
    countEl.textContent = String(count);
    link.appendChild(countEl);
  }
  if (drill) {
    const chevron = document.createElement('span');
    chevron.className = 'picker-item__chevron';
    chevron.textContent = '›';
    link.appendChild(chevron);
  }
  return link;
}
