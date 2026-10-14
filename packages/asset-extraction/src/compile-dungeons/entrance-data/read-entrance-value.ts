/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../../rom/rom-types';
import type { EntranceValueKind } from './entrance-data.type';

const readEntranceValue = (rom: RomData, kind: EntranceValueKind, address: number, index: number): number => {
  if (kind === 'word') return rom.getWord(address + index * 2);
  if (kind === 'int8') return rom.getInt8(address + index);
  return rom.getByte(address + index);
};

export { readEntranceValue };
