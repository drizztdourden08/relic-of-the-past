/* @layer shared-game @kind logic */
import { isPlainObject } from '../is-plain-object';
import { isUnknownArray } from '../is-unknown-array';
import { isAbsent } from './probe-reading';

const arraysEqual = (a: unknown, b: unknown): boolean => {
  if (!isUnknownArray(a) || !isUnknownArray(b)) return false;
  return a.length === b.length && a.every((item, index) => deepEqual(item, b[index]));
};

const objectsEqual = (a: unknown, b: unknown): boolean => {
  if (!isPlainObject(a) || !isPlainObject(b)) return false;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) if (!deepEqual(a[key], b[key])) return false;
  return true;
};

const deepEqual = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true;
  if (isAbsent(a)) return isAbsent(b);
  if (isAbsent(b)) return false;
  if (Array.isArray(a) || Array.isArray(b)) return arraysEqual(a, b);
  if (isPlainObject(a) || isPlainObject(b)) return objectsEqual(a, b);
  return false;
};

export { deepEqual };
