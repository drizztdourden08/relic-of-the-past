/* @layer renderer-lib @kind logic */
import type { RomImportResult } from '@shared/storage/roms';
import type { RomKind } from '@shared/storage/rom-kinds';
import * as roms from '@shared/storage/roms';
import { platformFiles } from '../platform-files';
import { emitRomProgress } from './emit-rom-progress';
import { finalizeRomImport } from './finalize-rom-import';

const importFile = async (file: File, kind: RomKind = 'snes-alttp'): Promise<RomImportResult> => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return finalizeRomImport(await roms.importBytes(platformFiles(), file.name, bytes, kind, (phase) => emitRomProgress(phase)));
};

export { importFile };
