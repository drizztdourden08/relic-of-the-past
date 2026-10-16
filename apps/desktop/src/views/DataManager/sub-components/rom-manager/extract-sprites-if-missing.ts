/* @layer renderer-components @kind logic */
import * as spritesStore from '@app/storage/sprites-store';
import { SPRITE_FALLBACK_ERROR } from './rom-extraction.constants';

const extractSpritesIfMissing = async (romFile: string): Promise<string | null> => {
  const { extracted } = await spritesStore.checkSpritesExtracted(romFile);
  if (extracted) return null;
  const result = await spritesStore.extractSprites(romFile);
  return result.success ? null : result.error ?? SPRITE_FALLBACK_ERROR;
};

export { extractSpritesIfMissing };
