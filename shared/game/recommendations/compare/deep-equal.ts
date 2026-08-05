/* @layer shared-game @kind logic */
/**
 * Structural equality for one probe's value against the record's current
 * value. Split out of `run-comparison.ts` to keep that file under the size
 * cap once the classification and formatting logic sit alongside it.
 *
 * `undefined`, `null` and a missing key all compare equal to one another. A
 * record that never declared a field, one that set it to `undefined`, and one
 * that set it to `null` all mean "nothing here" throughout this codebase (see
 * `known()` in `probe-helpers.ts`, which folds a live `null` reading to
 * `undefined` for exactly this reason), so none of the three should read as a
 * difference against either of the others.
 */

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const deepEqual = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true;
  if (a === undefined || a === null) return b === undefined || b === null;
  if (b === undefined || b === null) return false;

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  if (isPlainObject(a) || isPlainObject(b)) {
    if (!isPlainObject(a) || !isPlainObject(b)) return false;
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) if (!deepEqual(a[key], b[key])) return false;
    return true;
  }

  return false;
};

export { deepEqual };
