/* @layer renderer-lib @kind logic */
import { readLinkSprite } from '@app/lib/storage/link-sprites-store';
import { isRspName } from '@rotp/packs';
import { toZsprBytes } from '@rotp/packs';
import { loadSheet } from './load-sheet';

const readSpriteAsZspr = async (name: string): Promise<Uint8Array | null> => {
  if (!isRspName(name)) return readLinkSprite(name);
  const sheet = await loadSheet(name);
  return sheet ? toZsprBytes(sheet) : null;
};

export { readSpriteAsZspr };
