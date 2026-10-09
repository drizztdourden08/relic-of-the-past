/* @layer shared-hud @kind logic */
import { HUD_PRESETS } from './presets.constants';
import type { HudPreset } from './presets.type';

const presetById = (id: string): HudPreset | undefined => HUD_PRESETS.find((preset) => preset.id === id);

export { presetById };
