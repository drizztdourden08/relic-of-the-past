/* @layer renderer-app @kind logic */
import type { MouseEvent } from 'react';
import { ID_REF_SELECTOR } from '../DataInspector.constants';

const markedAncestor = (event: MouseEvent<HTMLElement>): HTMLElement | null => {
  const origin = event.target;
  if (!(origin instanceof Element)) return null;
  return origin.closest<HTMLElement>(ID_REF_SELECTOR);
};

export { markedAncestor };
