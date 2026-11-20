/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { getRomFont } from './get-rom-font';
import { list } from './list';

const missingRomFonts = async (files: FileStore): Promise<string[]> => {
  const latin = (await list(files)).filter((set) => set.script !== 'japanese');
  const bases = new Set(latin.map((set) => set.base));
  const missing: string[] = [];
  for (const base of bases) if (!(await getRomFont(files, base))) missing.push(base);
  return missing;
};

export { missingRomFonts };
