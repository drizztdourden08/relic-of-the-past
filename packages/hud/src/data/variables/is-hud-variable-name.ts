/* @layer shared-hud @kind logic */
import { HUD_VARIABLE_NAMES } from './variables.constants';

const isHudVariableName = (name: string): boolean => HUD_VARIABLE_NAMES.has(name);

export { isHudVariableName };
