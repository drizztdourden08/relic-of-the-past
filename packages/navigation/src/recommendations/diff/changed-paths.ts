/* @layer shared-game @kind logic */
import { childPath } from '../child-path';
import { isAbsent } from '../compare/probe-reading';
import { isPlainObject } from '../is-plain-object';
import { isUnknownArray } from '../is-unknown-array';

const bothUndefined = (a: unknown, b: unknown): boolean => a === undefined && b === undefined;

const asArray = (value: unknown): unknown[] | null => {
  if (isUnknownArray(value)) return value;
  return isAbsent(value) ? [] : null;
};

const asObject = (value: unknown): Record<string, unknown> | null => {
  if (isPlainObject(value)) return value;
  return isAbsent(value) ? {} : null;
};

const walkArrays = (current: unknown, proposed: unknown, path: string, out: string[]): boolean => {
  const a = asArray(current);
  const b = asArray(proposed);
  if (!a || !b) return false;
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i += 1) walk(a[i], b[i], childPath(path, String(i), true), out);
  return true;
};

const walkObjects = (current: unknown, proposed: unknown, path: string, out: string[]): boolean => {
  const a = asObject(current);
  const b = asObject(proposed);
  if (!a || !b) return false;
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    walk(a[key], b[key], childPath(path, key, false), out);
  }
  return true;
};

const walk = (current: unknown, proposed: unknown, path: string, out: string[]): void => {
  if (bothUndefined(current, proposed)) return;
  const isArrayPair = Array.isArray(current) || Array.isArray(proposed);
  if (isArrayPair && walkArrays(current, proposed, path, out)) return;
  const isObjectPair = isPlainObject(current) || isPlainObject(proposed);
  if (isObjectPair && walkObjects(current, proposed, path, out)) return;
  if (!Object.is(current, proposed)) out.push(path);
};

const changedPaths = (current: unknown, proposed: unknown): readonly string[] => {
  const out: string[] = [];
  walk(current, proposed, '', out);
  return out;
};

export { changedPaths };
