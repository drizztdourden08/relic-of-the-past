/* @layer renderer-app @kind hook */
import type { MovementType, OrientationLayout, TouchButtonShape, TouchEmit } from '@rotp/features';
import {
  addButton,
  addGroup,
  removeButton,
  setButtonEmit,
  setButtonScale,
  setButtonShape,
  setGroupLocked,
  setMovementScale,
  setMovementType,
} from '@rotp/input-mapping';
import type { GroupPresetId } from '@rotp/input-mapping';
import { ADD_AT } from '../TouchLayoutEditor.constants';
import type { EditorActionsInput } from './useEditorActions.type';

const useEditorActions = ({ layout, box, onLayout, onSelect }: EditorActionsInput) => {
  const placeAndSelect = (next: OrientationLayout): void => {
    onLayout(next);
    const created = next.buttons.find((button) => !layout.buttons.some((old) => old.id === button.id));
    onSelect(created ? { kind: 'button', id: created.id } : null);
  };

  return {
    setEmit: (id: string, emit: TouchEmit) => onLayout(setButtonEmit(layout, id, emit)),
    setScale: (id: string, scale: number) => onLayout(setButtonScale(layout, id, scale)),
    setShape: (id: string, shape: TouchButtonShape) => onLayout(setButtonShape(layout, id, shape)),
    setLocked: (groupId: string, locked: boolean) => onLayout(setGroupLocked(layout, groupId, locked)),
    setMovement: (type: MovementType) => onLayout(setMovementType(layout, type)),
    setMovementSize: (scale: number) => onLayout(setMovementScale(layout, scale)),
    remove: (id: string) => {
      onLayout(removeButton(layout, id));
      onSelect(null);
    },
    add: (emit: TouchEmit) => placeAndSelect(addButton(layout, emit, ADD_AT)),
    addGroup: (presetId: GroupPresetId) => placeAndSelect(addGroup(layout, presetId, ADD_AT, box)),
  };
};

export { useEditorActions };
