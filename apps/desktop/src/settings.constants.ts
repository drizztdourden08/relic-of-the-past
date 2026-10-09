/* @layer renderer-app @kind constants */
import { DEFAULT_BASE_SETTINGS, detectHost } from '@drizztdourden08/brock-core';
import { DEFAULT_SETTINGS as GAME_DEFAULTS } from '@rotp/game-core';
import type { AppSettings } from './settings.type';

const DEFAULT_SETTINGS: AppSettings = {
  ...DEFAULT_BASE_SETTINGS,
  ...GAME_DEFAULTS,
  syncedRateInFullscreen: detectHost() === 'capacitor',
};

export { DEFAULT_SETTINGS };
