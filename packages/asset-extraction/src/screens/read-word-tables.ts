/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import { readWordRegion } from './read-word-region';
import type { PauseTable, ScreenAddressTable, ScreenPayload } from './screen-payload.type';
import { PAUSE_TABLES } from './screens.constants';

const readWordTables = (
  rom: RomData,
  table: Pick<ScreenAddressTable, 'creditsDigits' | 'dungeonMapLabels' | 'pauseText'>,
): Pick<ScreenPayload, 'creditsDigits' | 'dungeonMapLabels' | 'pauseText'> => ({
  pauseText: Object.fromEntries(
    PAUSE_TABLES.map((id) => [id, readWordRegion(rom, table.pauseText[id])]),
  ) as Record<PauseTable, Uint16Array>,
  dungeonMapLabels: readWordRegion(rom, table.dungeonMapLabels),
  creditsDigits: readWordRegion(rom, table.creditsDigits),
});

export { readWordTables };
