/* @layer renderer-components @kind logic */
import type { TilePassability } from '@shared/game/navigation/types';
import type { TileInteractable } from '@shared/game/navigation/tile-classification';

/** Collision row text, giving the passability type plus the requirement for an obstacle. */
const collisionText = (collision: TilePassability): string => {
  if (collision.type === 'obstacle') return `obstacle · req ${collision.req}`;
  if (collision.type === 'ledge') return `ledge (${collision.dir})`;
  return collision.type;
};

// Green/red only for an obstacle whose current-loadout answer is known; otherwise the default colour.
const collisionColor = (collision: TilePassability, canPass: boolean | null): string | undefined => {
  if (collision.type !== 'obstacle' || canPass === null) return undefined;
  return canPass ? 'var(--c-green-bright)' : 'var(--c-danger)';
};

const interactableText = (interactable: TileInteractable): string => `${interactable.kind} · ${interactable.state}`;

/** Source tag for the interactable row, naming which live side-table resolved it and its slot. */
const interactableTag = (interactable: TileInteractable): string => {
  const { source, slot } = interactable;
  if (source === 'door-table') return `door[${slot}]`;
  if (source === 'replacement-tile-state') return `repl[${slot}]`;
  return `chest[${slot}]`;
};

export { collisionText, collisionColor, interactableText, interactableTag };
