/* @layer renderer-lib @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { readLanguageSets } from '@rotp/languages';
import { assets } from '@rotp/roms';
import type { BakeInputs } from './asset-files.type';
import { ensureRomFonts } from './ensure-rom-fonts';

const readBakeInputs = async (files: FileStore, romFile: string): Promise<BakeInputs | null> => {
  const romBytes = await assets.readRomBytes(files, romFile);
  if (!romBytes) return null;
  await ensureRomFonts(files, romBytes);
  const languages = await readLanguageSets(files);
  const supplementRoms = await assets.readSupplementRoms(files);
  return { romBytes, supplementRoms, languages };
};

export { readBakeInputs };
