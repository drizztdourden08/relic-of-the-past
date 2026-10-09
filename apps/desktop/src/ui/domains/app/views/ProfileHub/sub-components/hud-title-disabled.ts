/* @layer renderer-components @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { TITLE_SETTING_KEYS } from './hud-settings.constants';

const isTitleDisabled = (key: string, settings: GameSettings): boolean =>
  key !== 'titleScreen' && TITLE_SETTING_KEYS.has(key) && settings.titleScreen === 'original';

export { isTitleDisabled };
