/* @layer renderer-app @kind constants */
import { DEFAULT_BASE_SETTINGS } from '@drizztdourden08/brock-core';
import { DEFAULT_SETTINGS as GAME_DEFAULTS } from '@app/lib/game/settings';
import type { AppSettings } from './settings.type';

const DEFAULT_SETTINGS: AppSettings = { ...DEFAULT_BASE_SETTINGS, ...GAME_DEFAULTS };

export { DEFAULT_SETTINGS };
