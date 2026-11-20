/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { LanguageSet, SetBakeInput } from '../messages';
import type { RomFontBytes } from '../sets';
import { getRomFont, getSet, list as listSets } from '../sets';

const NO_FONT: RomFontBytes = { fontData: new Uint8Array(0), fontWidth: new Uint8Array(0) };

// A Japanese set bakes without a font: the core draws its glyphs from the Japanese graphics pack.
const fontOf = async (files: FileStore, set: LanguageSet): Promise<RomFontBytes | null> =>
  set.script === 'japanese' ? NO_FONT : getRomFont(files, set.base);

const readLanguageSets = async (files: FileStore): Promise<SetBakeInput[]> => {
  const out: SetBakeInput[] = [];
  for (const { id } of await listSets(files)) {
    const set = await getSet(files, id);
    const font = set ? await fontOf(files, set) : null;
    if (!set || !font) continue;
    out.push({ set, fontData: font.fontData, fontWidth: font.fontWidth });
  }
  return out;
};

export { readLanguageSets };
