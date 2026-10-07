/* @layer shared-game @kind logic */
/**
 * Get/set over the SAME path grammar `diff.ts`'s `join()` produces: dotted
 * keys, bracketed array indices (`gameId.roomIndex`, `tags[2]`).
 *
 * `apps/web/src/ui/design-system/data/schema/path.ts` already does get/set
 * over a path grammar, but its grammar is a plain dot-numeric one
 * (`items.0.name`), not the bracketed one `diff.ts` emits. It also lives in
 * the renderer package, which `shared/` may never import from (`shared/`
 * stays a leaf; see `detection-types.ts` for the same constraint applied to
 * observation types). So this is a small local parser instead of a shared
 * import, kept deliberately close in spirit to that file: `getPath` never
 * throws, `setPath` clones every container along the path and creates missing
 * intermediates, leaving the input untouched.
 */

/** A segment plus whether it came from `[123]` (array) or a dotted `name` (key). */
interface Segment { key: string; isIndex: boolean }

/** Matches one dotted key run, or one bracketed index, in path order. */
const SEGMENT_PATTERN = /[^.[\]]+|\[(\d+)\]/g;

const segmentsOf = (path: string): readonly Segment[] => {
  const out: Segment[] = [];
  for (const match of path.matchAll(SEGMENT_PATTERN)) {
    const index = match[1];
    out.push(index !== undefined ? { key: index, isIndex: true } : { key: match[0], isIndex: false });
  }
  return out;
};

const isContainer = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getPath = (record: unknown, path: string): unknown => {
  if (!path) return record;
  let current: unknown = record;
  for (const segment of segmentsOf(path)) {
    if (!isContainer(current)) return undefined;
    current = (current as Record<string, unknown>)[segment.key];
  }
  return current;
};

/** A fresh container of the right sort for the segment that will index it. */
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

export { getPath, setPath };
