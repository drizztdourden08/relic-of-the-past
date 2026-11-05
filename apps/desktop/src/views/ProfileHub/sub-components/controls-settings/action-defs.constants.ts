/* @layer renderer-components @kind constants */
import type { ActionDef } from '@drizztdourden08/brock-input/renderer';
import { CHEAT_ACTIONS, FUNCTION_ACTION_LABELS, SHORTCUT_ACTIONS } from '@rotp/features';
import type { FunctionAction } from '@rotp/features';
import { SNES_ACTION_LABELS, SNES_BUTTONS, SNES_BUTTON_LABELS } from '@rotp/game-data';
import { SNES_ICON_MAP } from '@rotp/input-mapping';

const SNES_ACTIONS: readonly ActionDef[] = SNES_BUTTONS.map((button) => ({
  id: button,
  label: SNES_ACTION_LABELS[button],
  middleLabel: SNES_BUTTON_LABELS[button],
  glyph: SNES_ICON_MAP[button],
}));

const functionAction = (action: FunctionAction): ActionDef => ({ id: action, label: FUNCTION_ACTION_LABELS[action] });

const SHORTCUT_ACTION_DEFS: readonly ActionDef[] = SHORTCUT_ACTIONS.map(functionAction);

const CHEAT_ACTION_DEFS: readonly ActionDef[] = CHEAT_ACTIONS.map(functionAction);

export { CHEAT_ACTION_DEFS, SHORTCUT_ACTION_DEFS, SNES_ACTIONS };
