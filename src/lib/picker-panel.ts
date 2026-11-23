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
export function createPickerFooter(
  href: string,
  label: string,
  close: () => void,
): HTMLAnchorElement {
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
  /** Alternate row look. 'listing' adds the picker-item--listing class. */
  variant?: 'listing';
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
  variant,
}: PickerRow): HTMLAnchorElement {
  const link = document.createElement('a');
  link.href = href;
  link.className = variant === 'listing' ? 'picker-item picker-item--listing' : 'picker-item';

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

  if (count !== undefined && variant !== 'listing') {
    const countEl = document.createElement('span');
    countEl.className = 'picker-item__count';
    countEl.textContent = String(count);
    link.appendChild(countEl);
  }
  if (drill || variant === 'listing') {
    const chevron = document.createElement('span');
    chevron.className = 'picker-item__chevron';
    chevron.textContent = '›';
    link.appendChild(chevron);
  }
  return link;
}

/** One row source for mountPicker. It is plain data, not DOM. */
export interface PickerRowDescriptor {
  href: string;
  name: string;
  meta?: string;
  count?: number | string;
  /** Chevron row that drills into another level. */
  drill?: boolean;
  /** Item identifier handed to onDrill. */
  value?: unknown;
  /** Alternate row look; 'listing' adds the picker-item--listing class. */
  variant?: 'listing';
}

/** Live panel parts handed to the picker callbacks. */
export interface PickerMountContext<Item> {
  root: HTMLElement;
  base: string;
  panel: HTMLDivElement;
  searchInput: HTMLInputElement;
  listEl: HTMLDivElement;
  /** Footer element, or null when the picker has no footer. */
  footer: HTMLElement | null;
  /** Loaded items. This is the render source for buildRows. */
  items: Item[];
  /** Close the panel. */
  close: () => void;
}

export interface MountPickerOptions<Item> {
  root: HTMLElement;
  button: HTMLButtonElement;
  arrow: HTMLElement;
  /** Root property that stores the panel element. */
  panelKey: string;
  /** Root property that stores the refresh callback. */
  refreshKey: string;
  load: (base: string) => Promise<Item[]>;
  buildFooter: (ctx: PickerMountContext<Item>) => HTMLElement | null;
  buildRows: (items: Item[], query: string) => PickerRowDescriptor[];
  /** Drill re-render hook. The caller moves its own level state here. */
  onDrill?: (
    value: unknown,
    descriptor: PickerRowDescriptor,
    ctx: PickerMountContext<Item>,
  ) => void;
  crumbs?: PickerCrumbs;
  withSearch?: boolean;
  searchPlaceholder?: string | (() => string);
  emptyText: string | (() => string);
}

/**
 * Bound picker roots for this session.
 * The guard is element-scoped on purpose. A global string key would re-bind the
 * persisted header node after every navigation.
 */
const mountedPickerRoots = new WeakSet<HTMLElement>();

/** Read a literal or a getter, so i18n text stays current. */
function readPickerText(value: string | (() => string)): string {
  return typeof value === 'function' ? value() : value;
}

/**
 * Bind one header picker: button, panel, search, rows, and footer.
 * The tag picker and the geo picker share this code.
 *
 * @param options
 */
export function mountPicker<Item>(options: MountPickerOptions<Item>): void {
  const { root, button, arrow, panelKey, refreshKey, load, buildFooter, buildRows, crumbs } =
    options;
  const withSearch = options.withSearch ?? true;

  if (mountedPickerRoots.has(root)) return;
  mountedPickerRoots.add(root);

  const base = root.dataset.base || '';
  // SAFETY: The root element carries picker state as ad-hoc properties.
  // TypeScript cannot type the dynamic keys.
  const store = root as unknown as Record<string, unknown>;
  let ctx: PickerMountContext<Item> | null = null;

  const dropdown = createPickerPanel({
    button,
    arrow,
    getPanel: () => (store[panelKey] as HTMLElement | null) ?? null,
  });

  function render(): void {
    if (!ctx) return;
    ctx.searchInput.placeholder = readPickerText(options.searchPlaceholder ?? '');
    ctx.listEl.innerHTML = '';
    const descriptors = buildRows(ctx.items, ctx.searchInput.value.trim());

    if (descriptors.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'picker-empty';
      empty.textContent = readPickerText(options.emptyText);
      ctx.listEl.appendChild(empty);
      return;
    }

    for (const descriptor of descriptors) {
      const row = createPickerRow({
        href: descriptor.href,
        name: descriptor.name,
        meta: descriptor.meta,
        count: descriptor.count,
        drill: descriptor.drill,
        variant: descriptor.variant,
      });
      row.addEventListener('click', (event) => {
        event.preventDefault();
        if (descriptor.drill) {
          // The re-render removes this anchor, so stop the click here.
          // Otherwise the floating dropdown sees a detached target and closes.
          event.stopPropagation();
          const current = ctx;
          if (!current) return;
          options.onDrill?.(descriptor.value, descriptor, current);
          current.searchInput.value = '';
          render();
          return;
        }
        dropdown.close();
        navigateInternal(row.href);
      });
      ctx.listEl.appendChild(row);
    }
  }

  function ensurePanel(items: Item[]): void {
    const existing = store[panelKey] as HTMLElement | null;
    if (existing?.isConnected) return;

    const { panel, searchInput, listEl } = createPickerPanelDom(
      readPickerText(options.searchPlaceholder ?? ''),
      withSearch,
    );
    const panelCtx: PickerMountContext<Item> = {
      root,
      base,
      panel,
      searchInput,
      listEl,
      footer: null,
      items,
      close: () => dropdown.close(),
    };

    if (crumbs) panel.insertBefore(crumbs.el, listEl);

    const footer = buildFooter(panelCtx);
    if (footer) {
      panel.appendChild(footer);
      panelCtx.footer = footer;
    }

    if (withSearch) {
      searchInput.addEventListener('input', () => render());
      searchInput.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        const first = listEl.querySelector('.picker-item') as HTMLAnchorElement | null;
        first?.click();
      });
    }

    ctx = panelCtx;
    render();
    store[panelKey] = panel;
  }

  store[refreshKey] = () => {
    render();
  };

  window.addEventListener('lang-changed', () => {
    if (ctx && !ctx.panel.hidden) render();
  });

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    void (async () => {
      const items = await load(base);
      if (ctx) {
        ctx.items = items;
        render();
      } else {
        ensurePanel(items);
      }
      dropdown.toggle();
    })();
  });
}
