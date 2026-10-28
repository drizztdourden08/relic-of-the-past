/* @layer renderer-app @kind logic */
import type { PathRead } from './setting-path.type';

const readAtPath = (source: object, path: readonly string[]): PathRead => {
  const [head, ...rest] = path;
  if (head === undefined || !Reflect.has(source, head)) return { known: false, value: undefined };
  const value: unknown = Reflect.get(source, head);
  if (rest.length === 0) return { known: true, value };
  return typeof value === 'object' && value !== null ? readAtPath(value, rest) : { known: false, value: undefined };
};

export { readAtPath };
