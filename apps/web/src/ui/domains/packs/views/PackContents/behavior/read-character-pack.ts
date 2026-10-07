/* @layer renderer-components @kind logic */
/** A character pack's sheet. The `.rsp` carries its own palettes, so no ROM is needed to draw it. */
import { parseRsp } from '@shared/storage/link-sprites/parse-rsp';
import type { PlayerSheet } from '@shared/game/data/player-sheet/types';
import type { PackSource } from '../../../pack-source.type';

const readCharacterPack = async (source: PackSource): Promise<PlayerSheet> => {
  const sheet = await parseRsp(await source.range(0, source.bytes));
  if (!sheet) throw new Error('This character pack could not be read. The file may be damaged.');
  return sheet;
};

export { readCharacterPack };
