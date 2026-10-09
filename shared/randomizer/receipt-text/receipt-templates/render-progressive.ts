/* @layer shared-game @kind logic */
import { primary } from '../highlight-markup/primary';

const renderProgressive = (slot: string): string =>
  `Your ${primary(slot.toLowerCase())} is better than it was.`;

export { renderProgressive };
