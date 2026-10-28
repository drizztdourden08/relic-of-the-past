/* @layer website-site @kind logic */
import type { MouseEvent } from 'react';

const shield = (action: () => void) => (event: MouseEvent<HTMLElement>) => {
  event.stopPropagation();
  action();
};

export { shield };
