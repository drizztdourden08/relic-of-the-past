/* @layer renderer-components @kind logic */
import type { TileInteractable } from '@rotp/navigation';

const interactableTag = (interactable: TileInteractable): string => {
  const { source, slot } = interactable;
  if (source === 'door-table') return `door[${slot}]`;
  if (source === 'replacement-tile-state') return `repl[${slot}]`;
  return `chest[${slot}]`;
};

export { interactableTag };
