/* @layer renderer-lib @kind logic */
import type { RomImportResult, RomKind } from '@rotp/roms';
import { importRomJob } from './import-rom-job';

const importFile = (file: File, kind: RomKind = 'snes-alttp'): Promise<RomImportResult> =>
  importRomJob(kind, async () => ({ fileName: file.name, bytes: new Uint8Array(await file.arrayBuffer()) }));

export { importFile };
