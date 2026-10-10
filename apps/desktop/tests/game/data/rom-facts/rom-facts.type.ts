/* @layer tests @kind type */
import type { ConnectionRecord, ScreenRecord } from '@rotp/game-data';
import type { readRomNativeTables } from '@rotp/randomizer';

type RomTables = ReturnType<typeof readRomNativeTables>;

type RomFacts = {
  rom: RomTables;
  screens: readonly ScreenRecord[];
  connections: readonly ConnectionRecord[];
  mouthsById: Map<number, RomTables['mouths'][number][]>;
};

export type { RomFacts, RomTables };
