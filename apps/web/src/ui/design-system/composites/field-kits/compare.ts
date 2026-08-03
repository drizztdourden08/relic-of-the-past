/* @layer renderer-components @kind logic */
/**
 * Comparator plumbing shared by the kits. Absent values sort last in both
 * directions — the same promise the core's fallback makes — so flipping a
 * column never hides the rows that have no value for it.
 */
import { isNullish, toText } from './coerce';
import type { Comparator } from '../../data/table/strategy-registry';

const nullsLast = (compare: Comparator): Comparator => (a, b) => {
  if (isNullish(a) && isNullish(b)) return 0;
  if (isNullish(a)) return 1;
  if (isNullish(b)) return -1;
  return compare(a, b);
};

/**
 * Human ordering for text: case-insensitive, and digit runs compare as numbers
 * so `screen-9` lands before `screen-10` instead of after it.
 */
const naturalTextCompare: Comparator = (a, b) =>
  toText(a).localeCompare(toText(b), undefined, { numeric: true, sensitivity: 'base' });

export { naturalTextCompare, nullsLast };
