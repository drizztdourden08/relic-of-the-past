/* @layer shared-hud @kind logic */
import { HUD_SCOPE_EXTRAS, HUD_VARIABLES } from './variables-table.constants';

const hudVariableNamesFor = (context: { insideRepeat: boolean }): readonly string[] =>
  context.insideRepeat ? [...HUD_VARIABLES.map((entry) => entry.name), ...HUD_SCOPE_EXTRAS] : HUD_VARIABLES.map((entry) => entry.name);

export { hudVariableNamesFor };
