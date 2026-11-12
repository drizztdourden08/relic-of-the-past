/* @layer renderer-app @kind logic */
import { SWALLOW_CLICK_MS } from './bind-directions.constants';

const swallowNextClick = (): void => {
  const stop = (event: Event): void => {
    event.stopPropagation();
    event.preventDefault();
    window.removeEventListener('click', stop, true);
  };
  window.addEventListener('click', stop, true);
  setTimeout(() => window.removeEventListener('click', stop, true), SWALLOW_CLICK_MS);
};

export { swallowNextClick };
