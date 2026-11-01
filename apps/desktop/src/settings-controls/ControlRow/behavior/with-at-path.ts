/* @layer renderer-app @kind logic */
import { readAtPath } from './read-at-path';

const withAtPath = (source: object, path: readonly string[], value: unknown): object => {
  const [head, ...rest] = path;
  if (head === undefined) return source;
  if (rest.length === 0) return { ...source, [head]: value };
  const child = readAtPath(source, [head]).value;
  return { ...source, [head]: withAtPath(typeof child === 'object' && child !== null ? child : {}, rest, value) };
};

export { withAtPath };
