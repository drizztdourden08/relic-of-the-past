/* @layer renderer-components @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { optionText } from '@rotp/randomizer';
import type { TileInteractable } from '@rotp/navigation';
import { STATE_MESSAGE } from './interactable-text.constants';

const interactableText = (interactable: TileInteractable): string =>
  optionText(msg('views-navigation:overlay.interactable', { kind: interactable.kind, state: optionText(STATE_MESSAGE[interactable.state]) }));

export { interactableText };
