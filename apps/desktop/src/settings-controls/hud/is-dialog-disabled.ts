/* @layer renderer-components @kind logic */
import type { GameSettings } from '@rotp/features';
import { ENHANCED_BOX_KEYS, MODERN_ONLY_KEYS } from './hud-controls.constants';
import { isBorderDisabled } from './is-border-disabled';
import { isTextureDisabled } from './is-texture-disabled';

const isDialogDisabled = (key: string, settings: GameSettings): boolean => {
  if (!ENHANCED_BOX_KEYS.has(key)) return false;
  if (settings.dialogBox === 'original') return true;
  if (MODERN_ONLY_KEYS.has(key) && settings.dialogFont === 'original') return true;
  return isBorderDisabled(key, settings) || isTextureDisabled(key, settings);
};

export { isDialogDisabled };
