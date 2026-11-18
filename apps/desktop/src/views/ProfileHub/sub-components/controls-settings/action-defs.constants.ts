/* @layer renderer-components @kind constants */
import type { ActionDef } from '@drizztdourden08/brock-input/renderer';
import { SNES_ACTION_LABELS, SNES_BUTTONS, SNES_BUTTON_LABELS } from '@rotp/game-data';
import { SNES_ICON_MAP } from '@rotp/input-mapping';

const SNES_ACTIONS: readonly ActionDef[] = SNES_BUTTONS.map((button) => ({
  id: button,
  label: SNES_ACTION_LABELS[button],
  middleLabel: SNES_BUTTON_LABELS[button],
  glyph: SNES_ICON_MAP[button],
}));

export { SNES_ACTIONS };
