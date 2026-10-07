/* @layer renderer-components @kind logic */
/**
 * Which branch of a variant field the current value is in. Derivation merges
 * every branch into one `children` list, so the branch is read off the value:
 * a child belongs when its key is present, plus any non-optional child (a
 * discriminator). Nothing is guessed: an absent, non-object or unmatched value
 * resolves to no branch. Unknown keys are reported, never dropped.
 */
import type { FieldDescriptor } from '../../../data/schema/field-descriptor';

type UnionBranchStatus = 'resolved' | 'absent' | 'not-object' | 'unmatched';

interface UnionBranch {
  status: UnionBranchStatus;
  /** The children to render; empty unless the status is `resolved`. */
  fields: readonly FieldDescriptor[];
  /** Present keys no child descriptor covers. They are shown but never edited or removed. */
  extraKeys: readonly string[];
}

/** The last dot segment: the key this descriptor reads on its parent object. */
const keyOf = (field: FieldDescriptor): string => field.path.slice(field.path.lastIndexOf('.') + 1);

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const presentKeys = (value: Record<string, unknown>): ReadonlySet<string> =>
  new Set(Object.keys(value).filter((key) => value[key] !== undefined));

const noBranch = (status: UnionBranchStatus): UnionBranch => ({ status, fields: [], extraKeys: [] });

const detectUnionBranch = (field: FieldDescriptor, value: unknown): UnionBranch => {
  const children = field.children ?? [];
  if (value === undefined || value === null) return noBranch('absent');
  if (!isPlainObject(value)) return noBranch('not-object');
  const present = presentKeys(value);
  if (!children.some((child) => present.has(keyOf(child)))) return noBranch('unmatched');
  const known = new Set(children.map(keyOf));
  return {
    status: 'resolved',
    fields: children.filter((child) => present.has(keyOf(child)) || !child.optional),
    extraKeys: [...present].filter((key) => !known.has(key)),
  };
};

export { detectUnionBranch, keyOf };
export type { UnionBranch, UnionBranchStatus };
