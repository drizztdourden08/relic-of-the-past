/* @layer renderer-lib @kind logic */
import type { RomImportResult } from '@rotp/roms';
import type { RomKind } from '@rotp/roms';
import { roms } from '@rotp/roms';
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
