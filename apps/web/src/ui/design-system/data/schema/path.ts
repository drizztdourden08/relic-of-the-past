/* @layer renderer-components @kind logic */
/**
 * Dot-path get/set over nested records. Array steps are plain numeric segments
 * (`items.0.name`), because JS indexes arrays by string key anyway.
 *
 * `getPath` never throws. A missing intermediate yields `undefined`, which is
 * what a filter or a cell renderer wants for an absent field.
 * `setPath` is immutable: it clones every container along the path and leaves
 * the input untouched, so React state updates stay referentially honest.
 */

const isIndexSegment = (segment: string): boolean => /^\d+$/.test(segment);

const isContainer = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getPath = (obj: unknown, path: string): unknown => {
  if (!path) return obj;
  let current: unknown = obj;
  for (const segment of path.split('.')) {
    if (!isContainer(current)) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
};

/** A fresh container of the right sort for the segment that will index it. */
const emptyFor = (segment: string): unknown => (isIndexSegment(segment) ? [] : {});

const cloneContainer = (value: unknown, nextSegment: string | undefined): unknown => {
  if (Array.isArray(value)) return [...value];
  if (isContainer(value)) return { ...value };
  return nextSegment === undefined ? {} : emptyFor(nextSegment);
};

const setIn = (target: unknown, segments: readonly string[], value: unknown): unknown => {
  const [head, ...rest] = segments;
  const clone = cloneContainer(target, head) as Record<string, unknown>;
  if (rest.length === 0) {
    clone[head] = value;
    return clone;
  }
  const child = clone[head];
  clone[head] = setIn(isContainer(child) ? child : emptyFor(rest[0]), rest, value);
  return clone;
};

const setPath = <T>(obj: T, path: string, value: unknown): T => {
  if (!path) return value as T;
  return setIn(obj, path.split('.'), value) as T;
};

export { getPath, setPath };
