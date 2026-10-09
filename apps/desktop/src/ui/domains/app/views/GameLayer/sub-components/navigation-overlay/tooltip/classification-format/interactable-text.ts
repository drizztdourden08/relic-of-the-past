/* @layer renderer-components @kind logic */
import type { TileInteractable } from '@rotp/navigation';

const interactableText = (interactable: TileInteractable): string => `${interactable.kind} · ${interactable.state}`;

export { interactableText };
