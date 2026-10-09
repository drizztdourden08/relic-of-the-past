/* @layer renderer-components @kind logic */
import { encodablePresets } from './encodable-presets';
import { SPEED_CODE, SPEED_PRESETS } from './presets.constants';
import type { LanguageConfig } from '@rotp/game-data';
import type { Preset } from './presets.type';

const speedPresetsFor = (cfg: LanguageConfig): Preset[] =>
  encodablePresets(SPEED_CODE, cfg, SPEED_PRESETS);

export { speedPresetsFor };
