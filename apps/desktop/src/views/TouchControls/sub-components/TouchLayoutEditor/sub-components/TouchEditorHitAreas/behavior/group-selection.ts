/* @layer renderer-app @kind logic */
import type { OrientationLayout } from '@rotp/features';
import type { TouchEditorSelection } from '../../../TouchLayoutEditor.state.type';

const groupSelection = (layout: OrientationLayout, groupId: string): TouchEditorSelection => {
  const first = layout.buttons.find((button) => button.group === groupId);
  return first ? { kind: 'button', id: first.id } : null;
};

export { groupSelection };
