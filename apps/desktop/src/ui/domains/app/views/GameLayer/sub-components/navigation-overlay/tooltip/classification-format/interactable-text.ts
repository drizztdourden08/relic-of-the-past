/* @layer renderer-components @kind logic */
import type { TileInteractable } from '@shared/game/navigation/tile-classification';

const interactableText = (interactable: TileInteractable): string => `${interactable.kind} · ${interactable.state}`;

export { interactableText };
