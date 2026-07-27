/* @layer renderer-components @kind logic */
/**
 * Scrolls to and briefly flashes a settings row after the palette navigates there.
 * SettingsLayout has no prop to open pre-scrolled, and threading one through every settings
 * tab would touch 9 components across 5 levels — so this reaches into the DOM instead,
 * reusing the same [data-section] hook SettingsLayout.scrollTo already relies on, plus a
 * [data-setting-key] per row for per-setting precision. The bounded rAF retry covers the
 * gap between the tab switching and its content actually mounting.
 */
const FLASH_CLASS = 'is-search-hit';
const FLASH_DURATION_MS = 1200;

const scrollToAnchor = (anchor: string, budgetMs = 500): void => {
  const started = performance.now();

  const attempt = () => {
    const el = document.querySelector<HTMLElement>(`[data-setting-key="${anchor}"], [data-section="${anchor}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add(FLASH_CLASS);
      setTimeout(() => el.classList.remove(FLASH_CLASS), FLASH_DURATION_MS);
      return;
    }
    if (performance.now() - started < budgetMs) requestAnimationFrame(attempt);
  };

  requestAnimationFrame(attempt);
};

export { scrollToAnchor };
