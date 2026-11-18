/* @layer renderer-lib @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { readLanguageSets } from '@rotp/languages';
import { assets } from '@rotp/roms';
import type { BakeInputs } from './asset-files.type';
import { ensureRomFonts } from './ensure-rom-fonts';
import { gameRomBytes } from './game-rom-bytes';

const readBakeInputs = async (files: FileStore, romFile: string): Promise<BakeInputs | null> => {
  const picked = await assets.readRomBytes(files, romFile);
  if (!picked) return null;
  const romBytes = await gameRomBytes(files, picked);
  await ensureRomFonts(files, romBytes);
  const languages = await readLanguageSets(files);
  const supplementRoms = await assets.readSupplementRoms(files);
  return { romBytes, supplementRoms, languages };
};

export { readBakeInputs };
