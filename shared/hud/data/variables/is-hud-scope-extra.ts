/* @layer shared-hud @kind logic */
import { HUD_SCOPE_EXTRA_NAMES } from './variables.constants';
import type { HudScopeExtra } from './variables.type';

const isHudScopeExtra = (name: string): name is HudScopeExtra => HUD_SCOPE_EXTRA_NAMES.has(name);

export { isHudScopeExtra };
