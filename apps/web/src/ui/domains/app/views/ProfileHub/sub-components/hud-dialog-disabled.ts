/* @layer renderer-components @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { EITHER_BOX_KEYS, MODERN_ONLY_KEYS } from './hud-settings.constants';
import { isBorderDisabled } from './hud-dialog-border-disabled';
import { isTextureDisabled } from './hud-dialog-texture-disabled';

const isDialogDisabled = (key: string, settings: GameSettings): boolean => {
  if (EITHER_BOX_KEYS.has(key)) return false;
  if (settings.dialogBox === 'original') return true;
  if (MODERN_ONLY_KEYS.has(key) && settings.dialogFont === 'original') return true;
  return isBorderDisabled(key, settings) || isTextureDisabled(key, settings);
};

export { isDialogDisabled };
