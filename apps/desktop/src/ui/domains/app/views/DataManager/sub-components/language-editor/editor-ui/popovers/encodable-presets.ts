/* @layer renderer-components @kind logic */
import { encodableParams } from '@shared/game/language';
import type { LanguageConfig } from '@rotp/asset-extraction';
import type { Preset } from './presets.type';

const encodablePresets = (
  name: string,
  cfg: LanguageConfig,
  presets: readonly Preset[],
): Preset[] => {
  const values = encodableParams(name, cfg);
  if (values === null) return [];
  const allowed = new Set(values);
  return presets.filter((preset) => allowed.has(preset.param));
};

export { encodablePresets };
