/* @layer shared-game @kind logic */
import { isContainer } from './is-container';
import type { Segment } from './record-path.type';
import { segmentsOf } from './segments-of';

const emptyFor = (segment: Segment | undefined): unknown => (segment?.isIndex ? [] : {});

const cloneContainer = (value: unknown, nextSegment: Segment | undefined): unknown => {
  if (Array.isArray(value)) return [...value];
  if (isContainer(value)) return { ...value };
  return emptyFor(nextSegment);
};

const setAt = (target: unknown, segments: readonly Segment[], value: unknown): unknown => {
  const [head, ...rest] = segments;
  const clone = cloneContainer(target, head) as Record<string, unknown>;
  if (rest.length === 0) {
    clone[head.key] = value;
    return clone;
  }
  const child = clone[head.key];
  clone[head.key] = setAt(isContainer(child) ? child : emptyFor(rest[0]), rest, value);
  return clone;
};

const setPath = <T>(record: T, path: string, value: unknown): T => {
  if (!path) return value as T;
  return setAt(record, segmentsOf(path), value) as T;
};

export { setPath };
