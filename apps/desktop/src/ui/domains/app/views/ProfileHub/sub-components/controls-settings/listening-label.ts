/* @layer renderer-components @kind logic */
import { SNES_BUTTON_LABELS } from '@rotp/game-data';
import { FUNCTION_ACTION_LABELS } from '@shared/types/controls/functions/functions.constants';
import { CORE_VERB_LABELS } from '../controls/controls.constants';
import type { ListeningTarget } from './controls-settings.type';

const listeningLabel = (target: ListeningTarget): string => {
  switch (target.type) {
    case 'snes': return SNES_BUTTON_LABELS[target.button];
    case 'function': return FUNCTION_ACTION_LABELS[target.action];
    case 'core': return CORE_VERB_LABELS[target.verb];
    case 'slot': return target.slot.label;
  }
};

export { listeningLabel };
