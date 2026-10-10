/* @layer tests @kind helper */
import { all } from '@rotp/game-data';
import type { ConnectionRecord, ScreenRecord } from '@rotp/game-data';
import { readRomNativeTables } from '@rotp/randomizer';
import { usRom } from '../rom-fixture';
import type { RomFacts } from './rom-facts.type';

const readRomFacts = (): RomFacts => {
  const rom = readRomNativeTables(usRom());
  const screens = all('screen');
  const connections = all('connection');
  const mouthsById: RomFacts['mouthsById'] = new Map();
  for (const mouth of rom.mouths) {
    mouthsById.set(mouth.entranceId, [...(mouthsById.get(mouth.entranceId) ?? []), mouth]);
  }
  return { rom, screens, connections, mouthsById };
};

export { readRomFacts };
