/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { TableRegion } from './screen-payload.type';

const readWordRegion = (rom: RomData, region: TableRegion): Uint16Array =>
  Uint16Array.from(rom.getWords(region.address, region.count));

export { readWordRegion };
