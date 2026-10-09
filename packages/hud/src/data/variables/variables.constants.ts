/* @layer shared-hud @kind constants */
import { HUD_SCOPE_EXTRAS, HUD_VARIABLES } from './variables.data';

const HUD_VARIABLE_NAMES: ReadonlySet<string> = new Set(HUD_VARIABLES.map((entry) => entry.name));

const HUD_SCOPE_EXTRA_NAMES: ReadonlySet<string> = new Set(HUD_SCOPE_EXTRAS);

export { HUD_SCOPE_EXTRA_NAMES, HUD_VARIABLE_NAMES };
