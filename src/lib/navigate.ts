/** Internal navigation through Astro view transitions, with a hard fallback. */
type ShellWindow = Window & {
  __hellomrazNavigate?: (href: string) => void | Promise<void>;
};

export function navigateInternal(url: string): void {
  const navigate = (window as ShellWindow).__hellomrazNavigate;
  if (typeof navigate === 'function') {
    void navigate(url);
    return;
  }
  window.location.assign(url);
}
