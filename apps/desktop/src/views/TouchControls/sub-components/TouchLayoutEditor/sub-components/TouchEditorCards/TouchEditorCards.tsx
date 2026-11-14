/* @layer renderer-app @kind component */
import type { ReactNode } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { cardSide } from '../../behavior/card-side';
import { TouchAddCard } from '../TouchAddCard';
import { TouchButtonCard } from '../TouchButtonCard';
import { TouchLayerCard } from '../TouchLayerCard';
import { TouchMovementCard } from '../TouchMovementCard';
import './TouchEditorCards.css';
import type { TouchEditorCardsProps } from './TouchEditorCards.type';

const TouchEditorCards = (props: TouchEditorCardsProps) => {
  const { selection, layout, orientation, box, shared, actions, onShared, onReset } = props;
  if (!selection) return null;

  const placed = (card: ReactNode) => (
    <Box className={`touch-editor-cards touch-editor-cards--${cardSide(selection, layout, box, orientation)}`}>
      {card}
    </Box>
  );

  if (selection.kind === 'layer') return placed(<TouchLayerCard shared={shared} onChange={onShared} onReset={onReset} />);
  if (selection.kind === 'add') return placed(<TouchAddCard onPick={actions.add} onPickGroup={actions.addGroup} />);
  if (selection.kind === 'movement') {
    return placed(
      <TouchMovementCard
        type={layout.movementType}
        scale={layout.movements[layout.movementType].scale}
        onType={actions.setMovement}
        onScale={actions.setMovementSize}
      />,
    );
  }
  const button = layout.buttons.find((candidate) => candidate.id === selection.id);
  if (!button) return null;
  const { group: groupId } = button;
  return placed(
    <TouchButtonCard
      button={button}
      group={layout.groups.find((group) => group.id === groupId)}
      onEmit={(emit) => actions.setEmit(button.id, emit)}
      onScale={(scale) => actions.setScale(button.id, scale)}
      onForm={(form) => actions.setForm(button.id, form)}
      onRemove={() => actions.remove(button.id)}
      onLock={(locked) => groupId && actions.setLocked(groupId, locked)}
    />,
  );
};

export { TouchEditorCards };
