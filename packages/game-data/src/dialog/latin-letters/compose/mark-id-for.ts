/* @layer shared-game @kind logic */
import { APOSTROPHE_CARON_BASES, COMMA_CEDILLA_BASES, TURNED_COMMA_BASES } from '../latin-letters.constants';

const markIdFor = (root: string, mark: string): string => {
  if (mark === 'caron' && APOSTROPHE_CARON_BASES.has(root)) return 'apostropheRight';
  if (mark === 'cedilla' && COMMA_CEDILLA_BASES.has(root)) return 'commaBelow';
  if (mark === 'cedilla' && TURNED_COMMA_BASES.has(root)) return 'turnedComma';
  return mark;
};

export { markIdFor };
