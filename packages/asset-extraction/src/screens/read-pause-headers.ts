/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import { readWordRegion } from './read-word-region';
import type { PauseHeaderSource } from './screen-payload.type';
import { PAUSE_BOX_HEADER_WORDS, PROGRESS_HEADER_ROW_WORDS } from './screens.constants';

const readPauseHeaders = (rom: RomData, source: PauseHeaderSource | undefined): Uint16Array | undefined =>
  source
    ? Uint16Array.from([
        ...new Array<number>(PAUSE_BOX_HEADER_WORDS).fill(0),
        ...readWordRegion(rom, { address: source.pendantsRow, count: PROGRESS_HEADER_ROW_WORDS }),
        ...readWordRegion(rom, { address: source.crystalsRow, count: PROGRESS_HEADER_ROW_WORDS }),
      ])
    : undefined;

export { readPauseHeaders };
