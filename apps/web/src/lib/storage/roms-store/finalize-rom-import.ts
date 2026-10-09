/* @layer renderer-lib @kind logic */
import type { RomImportResult } from '@shared/storage/roms';
import { emitRomProgress } from './emit-rom-progress';

const finalizeRomImport = (result: RomImportResult): RomImportResult => {
  if (result.success) emitRomProgress('done');
  else emitRomProgress('error', undefined, undefined, result.error);
  return result;
};

export { finalizeRomImport };
