/* @layer shared-game @kind logic */
import { childPath } from '../child-path';
import { isAbsent } from '../compare/probe-reading';
import { isPlainObject } from '../is-plain-object';

const bothUndefined = (a: unknown, b: unknown): boolean => a === undefined && b === undefined;

const asArray = (value: unknown): unknown[] | null => {
  if (Array.isArray(value)) return value;
  return isAbsent(value) ? [] : null;
};

const asObject = (value: unknown): Record<string, unknown> | null => {
  if (isPlainObject(value)) return value;
  return isAbsent(value) ? {} : null;
};

const walk = (current: unknown, proposed: unknown, path: string, out: string[]): void => {
  if (bothUndefined(current, proposed)) return;

  if (Array.isArray(current) || Array.isArray(proposed)) {
    const a = asArray(current);
    const b = asArray(proposed);
    if (a && b) {
      const length = Math.max(a.length, b.length);
      for (let i = 0; i < length; i += 1) walk(a[i], b[i], childPath(path, String(i), true), out);
      return;
    }
  }

  if (isPlainObject(current) || isPlainObject(proposed)) {
    const a = asObject(current);
    const b = asObject(proposed);
    if (a && b) {
      for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
        walk(a[key], b[key], childPath(path, key, false), out);
      }
      return;
    }
  }

  if (!Object.is(current, proposed)) out.push(path);
};

const changedPaths = (current: unknown, proposed: unknown): readonly string[] => {
  const out: string[] = [];
  walk(current, proposed, '', out);
  return out;
};

export { changedPaths };
