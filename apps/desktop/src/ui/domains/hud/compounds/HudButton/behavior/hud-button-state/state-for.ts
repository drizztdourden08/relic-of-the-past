/* @layer renderer-hud @kind logic */
import type { HudButtonState } from '@rotp/hud';
import type { ButtonInputs } from '../../HudButton.type';

const stateFor = (inputs: ButtonInputs): HudButtonState => {
  if (inputs.pressed) return 'pressed';
  if (inputs.held) return 'held';
  if (inputs.unassigned) return 'unassigned';
  return 'idle';
};

export { stateFor };
