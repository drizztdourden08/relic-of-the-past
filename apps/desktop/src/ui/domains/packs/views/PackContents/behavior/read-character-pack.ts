/* @layer renderer-components @kind logic */
import { parseRsp } from '@rotp/packs';
import type { PlayerSheet } from '@rotp/game-data';
import type { PackSource } from '../../../pack-source.type';

const readCharacterPack = async (source: PackSource): Promise<PlayerSheet> => {
  const sheet = await parseRsp(await source.range(0, source.bytes));
  if (!sheet) throw new Error('This character pack could not be read. The file may be damaged.');
  return sheet;
};

export { readCharacterPack };
