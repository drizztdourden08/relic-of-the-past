/* @layer shared-asset-extraction @kind logic */
import { MARK_NAMES } from './accents.constants';
import type { MarkSplit } from './accents.type';

const markSplit = (token: string): MarkSplit | null => {
  const [letter, mark, extra] = [...token.normalize('NFD')];
  if (letter === undefined || mark === undefined || extra !== undefined) return null;
  return MARK_NAMES[mark] === undefined ? null : { letter, mark };
};

export { markSplit };
