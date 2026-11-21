/* @layer renderer-components @kind logic */
import type { ActionDef } from '@drizztdourden08/brock-input/renderer';
import { SNES_BUTTONS } from '@rotp/game-data';
import { SNES_ICON_MAP } from '@rotp/input-mapping';
import { SNES_ACTION_MESSAGES, SNES_BUTTON_MESSAGES } from './action-defs.constants';
import type { TextOf } from './action-defs.type';

const snesActionDefs = (text: TextOf): readonly ActionDef[] => SNES_BUTTONS.map((button) => ({
  id: button,
  label: SNES_ACTION_MESSAGES[button],
  middleLabel: text(SNES_BUTTON_MESSAGES[button]),
  glyph: SNES_ICON_MAP[button],
}));

export { snesActionDefs };
