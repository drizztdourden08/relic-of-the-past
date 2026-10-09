/* @layer shared-game @kind logic */
import { isContainer } from './is-container';
import { segmentsOf } from './segments-of';

const getPath = (record: unknown, path: string): unknown => {
  if (!path) return record;
  let current: unknown = record;
  for (const segment of segmentsOf(path)) {
    if (!isContainer(current)) return undefined;
    current = (current as Record<string, unknown>)[segment.key];
  }
  return current;
};

export { getPath };
