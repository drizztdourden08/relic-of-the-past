/* @layer renderer-lib @kind logic */
import type { RomImportResult } from '@shared/storage/roms';
import type { RomKind } from '@shared/storage/rom-kinds';
import * as roms from '@shared/storage/roms';
import { getPlatform } from '@drizztdourden08/brock-react';
import { platformFiles } from '../platform-files';
import { emitRomProgress } from './emit-rom-progress';
import { finalizeRomImport } from './finalize-rom-import';

const importPicked = async (kind: RomKind = 'snes-alttp'): Promise<RomImportResult | null> => {
  const picked = await getPlatform().filePicker.pickFile({ extensions: [...roms.pickExtensionsFor(kind)] });
  if (!picked) return null;
  return finalizeRomImport(await roms.importBytes(platformFiles(), picked.name, picked.bytes, kind, (phase) => emitRomProgress(phase)));
};

export { importPicked };
