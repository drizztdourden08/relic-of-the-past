/* @layer renderer-lib @kind logic */
import type { RomImportResult, RomKind } from '@rotp/roms';
import { roms } from '@rotp/roms';
import { getPlatform } from '@drizztdourden08/brock-react';
import { importRomBytes } from '../rom-files';
import { platformFiles } from '../platform-files';
import { emitRomProgress } from './emit-rom-progress';
import { finalizeRomImport } from './finalize-rom-import';

const importPicked = async (kind: RomKind = 'snes-alttp'): Promise<RomImportResult | null> => {
  const picked = await getPlatform().filePicker.pickFile({ extensions: [...roms.pickExtensionsFor(kind)], anyType: 'mobile' });
  if (!picked) return null;
  return finalizeRomImport(await importRomBytes(platformFiles(), { fileName: picked.name, bytes: picked.bytes }, kind, (phase) => emitRomProgress(phase)));
};

export { importPicked };
