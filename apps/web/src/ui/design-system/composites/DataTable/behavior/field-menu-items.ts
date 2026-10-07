/* @layer renderer-components @kind logic */
/**
 * Adapter from `buildPickerNodes` to `DropdownMenu` entries. A branch becomes
 * a submenu, a leaf an acting entry, an empty list one disabled entry.
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
