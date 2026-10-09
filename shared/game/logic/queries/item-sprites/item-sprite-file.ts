/* @layer shared-game @kind logic */
import type { ItemRecord } from '../../../data';
import { rupeeGemSpriteFileOf } from '../../../data/sprite-manifest/rupee-gem-files';
import { spriteFilename } from './sprite-filename';

const itemSpriteFile = (item: ItemRecord): string | undefined =>
  rupeeGemSpriteFileOf(item.gameId?.receiveItemId) ?? spriteFilename(item.spriteId);

export { itemSpriteFile };
