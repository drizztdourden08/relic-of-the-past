/* @layer renderer-lib @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { ROM_KINDS, isZip } from '@rotp/roms';
import type { ImportPhase, RomBytes, RomImportResult, RomKind } from '@rotp/roms';
import { errorMessage } from '../error-message';
import { importNameOf } from './import-name-of';
import { refusalMessage } from './refusal-message';
import { romStoreOf } from './rom-store-of';

const importRomBytes = async (files: FileStore, rom: RomBytes, kind: RomKind = 'snes-alttp', onPhase?: ImportPhase): Promise<RomImportResult> => {
  const { fileName, bytes } = rom;
  const spec = ROM_KINDS[kind];
  if (isZip(bytes)) onPhase?.('extract');
  onPhase?.('copy');
  try {
    const imported = await romStoreOf(files, kind).importRom(importNameOf(fileName, bytes, spec), bytes);
    if (!imported.ok) return { success: false, romFile: '', error: refusalMessage(imported, spec) };
    return { success: true, romFile: imported.file ?? '', alreadyExists: imported.existed ?? false };
  } catch (err) {
    return { success: false, romFile: '', error: errorMessage(err) };
  }
};

export { importRomBytes };
