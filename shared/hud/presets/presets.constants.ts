/* @layer shared-hud @kind constants */
import { readPreset } from './read-preset';
import { PRESET_SOURCES } from './presets.data';
import type { HudPreset } from './presets.type';

const HUD_PRESETS: readonly HudPreset[] = PRESET_SOURCES.map(({ id, name, icon, json }) => readPreset(id, name, icon, json));

export { HUD_PRESETS };
