/* @layer renderer-lib @kind logic */
import type { RomImportResult, RomKind } from '@rotp/roms';
import { roms } from '@rotp/roms';
import { getPlatform } from '@drizztdourden08/brock-react';
import { importRomJob } from './import-rom-job';

const importPicked = async (kind: RomKind = 'snes-alttp'): Promise<RomImportResult | null> => {
  const picked = await getPlatform().filePicker.pickFile({ extensions: [...roms.pickExtensionsFor(kind)], anyType: 'mobile' });
  if (!picked) return null;
  return importRomJob(kind, () => Promise.resolve({ fileName: picked.name, bytes: picked.bytes }));
};

export { importPicked };
