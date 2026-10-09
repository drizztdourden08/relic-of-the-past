/* @layer shared-game @kind logic */
import { primary } from '../highlight-markup';

const renderJunk = (item: string): string =>
  `It is ${primary(item)}. The pool can be cruel.`;

export { renderJunk };
