/* @layer renderer-components @kind logic */
import * as spritesStore from '@app/storage/sprites-store';
import type { I18n, Text } from '@drizztdourden08/brock-core/i18n';

const extractSpritesIfMissing = async (romFile: string, t: I18n['t']): Promise<Text | null> => {
  const { extracted } = await spritesStore.checkSpritesExtracted(romFile);
  if (extracted) return null;
  const result = await spritesStore.extractSprites(romFile);
  return result.success ? null : result.error ?? t('data-manager:rom-manager.sprite-failed');
};

export { extractSpritesIfMissing };
