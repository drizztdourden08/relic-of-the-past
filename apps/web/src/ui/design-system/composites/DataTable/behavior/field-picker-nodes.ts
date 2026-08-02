/* @layer renderer-components @kind logic */
/**
 * The recursive walk behind the add-column picker, kept as a pure transform so
 * the tree it produces can be asserted without rendering anything.
 *
 * Composite pattern, straight off `FieldDescriptor.children`: a field with
 * children is a BRANCH — it opens a submenu and is not itself selectable — and
 * a field without them is a pickable leaf. An array field is a leaf even though
 * it has an element descriptor, because element paths are not addressable.
 *
 * Depth is unbounded here; derivation already caps recursion, so the walk
 * always terminates.
 */
import type { FieldDescriptor, FieldKind } from '../../../data/schema/field-descriptor';

interface PickerNode {
  path: string;
  label: string;
  kind: FieldKind;
  /** Leaves are selectable; branches only open a submenu. */
  pickable: boolean;
  children: readonly PickerNode[];
}

const isNode = (node: PickerNode | undefined): node is PickerNode => node !== undefined;

/**
 * Returns undefined for anything that would render as a dead end: an excluded
 * leaf, or a branch whose whole subtree is excluded. A branch that still has
 * something under it survives even when some of its children do not.
 */
const toNode = (field: FieldDescriptor, exclude: ReadonlySet<string>): PickerNode | undefined => {
  const children = (field.children ?? []).map((child) => toNode(child, exclude)).filter(isNode);
  const isBranch = (field.children?.length ?? 0) > 0;
  if (isBranch) {
    if (!children.length) return undefined;
    return { path: field.path, label: field.label, kind: field.kind, pickable: false, children };
  }
  if (exclude.has(field.path)) return undefined;
  return { path: field.path, label: field.label, kind: field.kind, pickable: true, children: [] };
};

const buildPickerNodes = (
  schema: readonly FieldDescriptor[],
  excludePaths: readonly string[] = [],
): readonly PickerNode[] => {
  const exclude = new Set(excludePaths);
  return schema.map((field) => toNode(field, exclude)).filter(isNode);
};

/** Depth-first list of everything the picker would let you choose. */
const pickableLeafPaths = (nodes: readonly PickerNode[]): readonly string[] =>
  nodes.flatMap((node) => (node.pickable ? [node.path] : pickableLeafPaths(node.children)));

export { buildPickerNodes, pickableLeafPaths };
export type { PickerNode };
