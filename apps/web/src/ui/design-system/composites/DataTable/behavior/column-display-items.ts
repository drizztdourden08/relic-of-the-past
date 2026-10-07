/* @layer renderer-components @kind logic */
/**
 * The "Display as" block of a reference column's ⋯ menu. Without a reference
 * field or an injected lookup it contributes nothing. The id leads the submenu
 * and is ticked by default, so "put it back" is as reachable as the choice.
 */
import type { MenuEntry, MenuItem } from '../../DropdownMenu';
import type { FieldDescriptor } from '../../../data/schema/field-descriptor';
import type { IdRefTargetFieldResolver } from './display-substitution';
import type { ColumnActions } from '../DataTable.type';

interface ColumnDisplayInput {
  path: string;
  /** This column's field; only an `idRef` with a target has anything to offer. */
  field?: FieldDescriptor;
  /** The field of the target record currently shown, if any. */
  displayField?: string;
  /** Injected: what the collection this column points at holds. */
  resolveTargetFields?: IdRefTargetFieldResolver;
  actions: ColumnActions;
  /** Wraps an action so the menu closes before its change lands. */
  act: (run: () => void) => () => void;
}

const REFERENCE_KIND = 'idRef';

const ID_LABEL = 'Reference id';

const ID_KEY = 'display-id';

const buildColumnDisplayItems = (input: ColumnDisplayInput): MenuEntry[] => {
  const { path, field, displayField, resolveTargetFields, actions, act } = input;
  if (!field || field.kind !== REFERENCE_KIND || !field.targetKind) return [];

  const targets = resolveTargetFields?.(field.targetKind) ?? [];
  if (targets.length === 0) return [];

  const children: MenuItem[] = [
    {
      key: ID_KEY,
      label: ID_LABEL,
      checked: displayField === undefined,
      onClick: act(() => actions.onSetDisplayField(path, undefined)),
    },
    ...targets.map((target) => ({
      key: `display-${target.path}`,
      label: target.label,
      description: target.path,
      checked: displayField === target.path,
      onClick: act(() => actions.onSetDisplayField(path, target.path)),
    })),
  ];

  /* A swap glyph: the column shows one thing in place of another. */
  return [{ key: 'display-as', icon: '⇄', label: 'Display as...', children }];
};

export { ID_KEY, ID_LABEL, buildColumnDisplayItems };
export type { ColumnDisplayInput };
