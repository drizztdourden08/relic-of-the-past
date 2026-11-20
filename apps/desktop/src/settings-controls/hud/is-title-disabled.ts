/* @layer renderer-components @kind logic */
import type { GameSettings } from '@rotp/features';
import { TITLE_SETTING_KEYS } from './hud-controls.constants';

const isTitleDisabled = (key: string, settings: GameSettings): boolean => {
  if (key === 'originalTitle') return settings.titleScreen !== 'original';
  return key !== 'titleScreen' && TITLE_SETTING_KEYS.has(key) && settings.titleScreen === 'original';
};

export { isTitleDisabled };
