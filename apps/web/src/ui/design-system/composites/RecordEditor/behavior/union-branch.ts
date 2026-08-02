/* @layer renderer-components @kind logic */
/**
 * Which branch of a variant field the current value is actually in.
 *
 * Derivation merges every branch it saw into one `children` list — a placement
 * field ends up with the discriminator, the side-only fields and the area-only
 * fields side by side, and a requirement field ends up with every leaf form at
 * once. Rendering that merged list as a form would offer fields that cannot
 * co-exist, so the branch has to be read off the VALUE rather than the schema.
 *
 * The rule is deliberately small: a child belongs to this value's branch when
 * its key is actually present, plus any child derivation found on every sampled
 * record (`optional: false`) — that is what a discriminator looks like from
 * here, and it keeps one visible even on a value that somehow omits it.
 *
 * Nothing is guessed. A value that is absent, is not an object, or shares no key
 * at all with the schema resolves to no branch, and the caller falls back to the
 * read-only summary rather than inventing a form. Keys the schema does not know
 * are reported rather than dropped: they stay in the record untouched (only the
 * paths a control writes are ever rewritten) and the row says so.
 */
import type { FieldDescriptor } from '../../../data/schema/field-descriptor';

type UnionBranchStatus = 'resolved' | 'absent' | 'not-object' | 'unmatched';

interface UnionBranch {
  status: UnionBranchStatus;
  /** The children to render; empty unless the status is `resolved`. */
  fields: readonly FieldDescriptor[];
  /** Present keys no child descriptor covers — shown, never edited or removed. */
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
