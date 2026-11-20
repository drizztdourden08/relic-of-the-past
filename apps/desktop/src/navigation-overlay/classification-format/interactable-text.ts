/* @layer renderer-components @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { optionText } from '@rotp/randomizer';
import type { TileInteractable } from '@rotp/navigation';

const STATE_MESSAGE = {
  open: msg('views-navigation:overlay.state.open'),
  shut: msg('views-navigation:overlay.state.shut'),
  unknown: msg('views-navigation:overlay.state.unknown'),
} as const;

const interactableText = (interactable: TileInteractable): string =>
  optionText(msg('views-navigation:overlay.interactable', { kind: interactable.kind, state: optionText(STATE_MESSAGE[interactable.state]) }));

export { interactableText };
