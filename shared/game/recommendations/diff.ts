/* @layer shared-game @kind logic */
/**
 * What actually differs between the record the dataset holds and the record a
 * recommendation proposes.
 *
 * Deliberately STRUCTURAL, not textual. A line diff over two serialized records
 * answers the wrong question twice over: reordering two keys reads as a change
 * when nothing changed, and a change buried three levels down reads as a change
 * to whichever line happens to hold the brace. Walking both objects instead
 * reports each differing leaf at its real path, which is what a reviewer wants
 * to see and what `linesForPaths` needs to highlight anything.
 */
import { pathLines } from './path-lines';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** `a.b` for a member, `a[0]` for an element, bare at the root. */
const join = (parent: string, segment: string, isIndex: boolean): string => {
  if (isIndex) return `${parent}[${segment}]`;
  return parent ? `${parent}.${segment}` : segment;
};

/**
 * An absent key and a key set to `undefined` mean the same thing in every record
 * shape here — a connection with `nav: undefined` has no nav data, exactly like
 * one that never declared the field — so neither counts as a difference.
 */
const bothEmpty = (a: unknown, b: unknown): boolean => a === undefined && b === undefined;

/** Absent on one side only: compare against an empty container of the same shape. */
const isAbsent = (value: unknown): boolean => value === undefined || value === null;

const walk = (current: unknown, proposed: unknown, path: string, out: string[]): void => {
  if (bothEmpty(current, proposed)) return;

  // A subtree present on one side only reports its LEAVES, not itself. A
  // `create` diffs against nothing, and a root-level "everything changed" would
  // give the comparison view a path it cannot map to any line.
  const asArray = (value: unknown): unknown[] | null => Array.isArray(value) ? value
    : isAbsent(value) ? [] : null;
  const asObject = (value: unknown): Record<string, unknown> | null => isPlainObject(value) ? value
    : isAbsent(value) ? {} : null;

  if (Array.isArray(current) || Array.isArray(proposed)) {
    const a = asArray(current);
    const b = asArray(proposed);
    if (a && b) {
      const length = Math.max(a.length, b.length);
      for (let i = 0; i < length; i += 1) walk(a[i], b[i], join(path, String(i), true), out);
      return;
    }
  }

  if (isPlainObject(current) || isPlainObject(proposed)) {
    const a = asObject(current);
    const b = asObject(proposed);
    if (a && b) {
      for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
        walk(a[key], b[key], join(path, key, false), out);
      }
      return;
    }
  }

  // Either a genuine leaf, or a shape change (object became a scalar, array
  // became an object). A shape change is reported at its own path rather than
  // recursed into: the whole subtree is what changed.
  if (!Object.is(current, proposed)) out.push(path);
};

/**
 * Every path whose leaf value differs, in walk order. An empty result means the
 * two records are structurally identical, whatever their serializations look
 * like. A null `current` (a `create`) reports every path the proposal declares.
 */
const changedPaths = (current: unknown, proposed: unknown): readonly string[] => {
  const out: string[] = [];
  walk(current, proposed, '', out);
  return out;
};

/**
 * The 1-based lines those paths sit on in a serialized record — JSON or the
 * record emitter's TS output, both of which the scanner reads.
 *
 * A path the source does not declare falls back to its nearest declared
 * ancestor: a value removed by the proposal has no line of its own, and pointing
 * at the object that used to hold it is the honest answer. Lines come back
 * sorted and deduplicated, since several changed paths routinely share one line.
 */
const linesForPaths = (source: string, paths: readonly string[]): readonly number[] => {
  const declared = pathLines(source);
  const found = new Set<number>();

  for (const path of paths) {
    let probe = path;
    while (probe) {
      const line = declared.get(probe);
      if (line !== undefined) { found.add(line); break; }
      const cut = Math.max(probe.lastIndexOf('.'), probe.lastIndexOf('['));
      probe = cut <= 0 ? '' : probe.slice(0, cut);
    }
  }

  return [...found].sort((a, b) => a - b);
};

export { changedPaths, linesForPaths };
