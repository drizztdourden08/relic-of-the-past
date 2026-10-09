/* @layer renderer-components @kind logic */
import { FLASH_CLASS, FLASH_DURATION_MS } from '../SearchPalette.constants';

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
