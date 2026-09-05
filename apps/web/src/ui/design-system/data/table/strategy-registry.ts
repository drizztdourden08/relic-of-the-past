/* @layer renderer-components @kind logic */
/**
 * Registry of per-kind comparators and group-key functions. This is the table's
 * half of the strategy seam; the filter's half is filter/tester-registry.ts.
 *
 * Unlike the tester registry, lookups here ALWAYS resolve: an unregistered kind
 * falls back to a generic string ordering and a generic group key, so the table
 * sorts and groups sensibly on its own and the kits only ever improve it.
 */
import type { FieldKind } from '../schema/field-descriptor';

type Comparator = (a: unknown, b: unknown) => number;
type GroupKeyFn = (value: unknown) => string;

const isNullish = (value: unknown): boolean => value === undefined || value === null;

/** Absent values sort last in both directions, so a sort never hides them at the top. */
const fallbackComparator: Comparator = (a, b) => {
  if (isNullish(a) && isNullish(b)) return 0;
  if (isNullish(a)) return 1;
  if (isNullish(b)) return -1;
  const left = String(a);
  const right = String(b);
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
};

const fallbackGroupKey: GroupKeyFn = (value) => (isNullish(value) ? '' : String(value));

const comparators = new Map<FieldKind, Comparator>();
const groupKeys = new Map<FieldKind, GroupKeyFn>();

const registerComparator = (kind: FieldKind, compare: Comparator): void => {
  comparators.set(kind, compare);
};

const registerGroupKey = (kind: FieldKind, groupKey: GroupKeyFn): void => {
  groupKeys.set(kind, groupKey);
};

const getComparator = (kind: FieldKind): Comparator => comparators.get(kind) ?? fallbackComparator;

const getGroupKey = (kind: FieldKind): GroupKeyFn => groupKeys.get(kind) ?? fallbackGroupKey;

/** Test hygiene only. Production code registers once and never clears. */
const clearFieldStrategies = (): void => {
  comparators.clear();
  groupKeys.clear();
};

export {
  clearFieldStrategies, fallbackComparator, fallbackGroupKey,
  getComparator, getGroupKey, registerComparator, registerGroupKey,
};
export type { Comparator, GroupKeyFn };
