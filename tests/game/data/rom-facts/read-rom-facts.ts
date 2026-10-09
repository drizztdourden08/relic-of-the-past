/* @layer tests @kind helper */
import { all } from '@shared/game/data';
import type { ConnectionRecord, ScreenRecord } from '@shared/game/data/types';
import { readRomNativeTables } from '@shared/randomizer/audit/rom-native-tables';
import { usRom } from '../rom-fixture';
import type { RomFacts } from './rom-facts.type';

const readRomFacts = (): RomFacts => {
  const rom = readRomNativeTables(usRom());
  const screens = all('screen') as readonly ScreenRecord[];
  const connections = all('connection') as readonly ConnectionRecord[];
  const mouthsById: RomFacts['mouthsById'] = new Map();
  for (const mouth of rom.mouths) {
    mouthsById.set(mouth.entranceId, [...(mouthsById.get(mouth.entranceId) ?? []), mouth]);
  }
  return { rom, screens, connections, mouthsById };
};

export { readRomFacts };
