/* @layer renderer-components @kind logic */
import { encodablePresets } from './encodable-presets';
import { PAUSE_CODE, PAUSE_PRESETS } from './presets.constants';
import type { LanguageConfig } from '@rotp/asset-extraction';
import type { Preset } from './presets.type';

const pausePresetsFor = (cfg: LanguageConfig): Preset[] =>
  encodablePresets(PAUSE_CODE, cfg, PAUSE_PRESETS);

export { pausePresetsFor };
