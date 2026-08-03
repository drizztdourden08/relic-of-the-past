/* @layer renderer-components @kind logic */
/**
 * The field tree, expressed as menu entries.
 *
 * Adapter, plain and simple: `buildPickerNodes` already walks a schema into the
 * shape a chooser needs, and `DropdownMenu` already nests entries that carry
 * children. This maps one onto the other, so "add a column" can live INSIDE a
 * column's ⋯ menu as a submenu instead of floating a second panel of its own —
 * and so neither the walk nor the menu learns about the other.
 *
 * A branch becomes a submenu and is not itself clickable; a leaf becomes an
 * acting entry. Empty in means one disabled entry out rather than a submenu
 * that opens onto nothing.
 */
import type { PickerNode } from './field-picker-nodes';
import type { MenuItem } from '../../DropdownMenu';

interface FieldMenuInput {
  nodes: readonly PickerNode[];
  onPick: (path: string) => void;
  /** Shown, greyed, when every field is already in use. */
  emptyLabel?: string;
}

const DEFAULT_EMPTY_LABEL = 'No fields left to add';

const toEntries = (
  nodes: readonly PickerNode[],
  onPick: (path: string) => void,
): MenuItem[] =>
  nodes.map((node) => (node.pickable
    ? { key: node.path, label: node.label, onClick: () => onPick(node.path) }
    : { key: node.path, label: node.label, children: toEntries(node.children, onPick) }));

const buildFieldMenuItems = (input: FieldMenuInput): MenuItem[] => {
  const { nodes, onPick, emptyLabel = DEFAULT_EMPTY_LABEL } = input;
  if (nodes.length === 0) return [{ key: 'empty', label: emptyLabel, disabled: true }];
  return toEntries(nodes, onPick);
};

export { DEFAULT_EMPTY_LABEL, buildFieldMenuItems };
export type { FieldMenuInput };
