/* @layer renderer-lib @kind logic */
import type { RomImportResult, RomKind } from '@rotp/roms';
import { importRomBytes } from '../rom-files';
import { platformFiles } from '../platform-files';
import { emitRomProgress } from './emit-rom-progress';
import { finalizeRomImport } from './finalize-rom-import';

const importFile = async (file: File, kind: RomKind = 'snes-alttp'): Promise<RomImportResult> => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return finalizeRomImport(await importRomBytes(platformFiles(), { fileName: file.name, bytes }, kind, (phase) => emitRomProgress(phase)));
};

export { importFile };
