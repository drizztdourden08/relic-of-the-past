/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { TableRegion } from './screen-payload.type';

const readByteRegion = (rom: RomData, region: TableRegion): Uint8Array =>
  Uint8Array.from(rom.getBytes(region.address, region.count));

export { readByteRegion };
