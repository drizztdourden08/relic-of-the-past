/* @layer renderer-components @kind logic */
import type { GameSettings } from '@rotp/features';

const isTextureDisabled = (key: string, settings: GameSettings): boolean => {
  if (!key.startsWith('dialogTexture') || key === 'dialogTexture') return false;
  if (settings.dialogTexture === 'none') return true;
  return key === 'dialogTextureSpeed' && settings.dialogTextureAnimation === 'none';
};

export { isTextureDisabled };
