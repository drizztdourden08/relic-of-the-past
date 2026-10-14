/* @layer renderer-components @kind logic */
import { mergeSettings } from '@rotp/game-core';
import type { AppSettings } from '@app/settings.type';

const normaliseSettings = (settings: AppSettings): AppSettings => ({ ...settings, ...mergeSettings(settings) });

export { normaliseSettings };
