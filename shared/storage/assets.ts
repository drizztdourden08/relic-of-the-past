/* @layer shared-storage @kind logic */
/**
 * Asset blob (.dat) storage over FileStore + the inputs the extraction Worker needs.
 * The compile itself runs in a renderer Worker (Node-Buffer pipeline); this module
 * only does the FileStore I/O (read ROM + language sets, write the .dat).
 */
import type { FileStore } from '@shared/platform';
import type { SetBakeInput } from '@shared/game/language';
import { getSet, getSetFont, list as listSets } from './languages';

const datName = (romFile: string): string => romFile.replace(/\.(sfc|smc)$/i, '.dat');

const check = async (files: FileStore, romFile: string): Promise<boolean> => {
  const stat = await files.stat(`assets/${datName(romFile)}`);
  return !!stat && stat.bytes > 0;
};

const load = (files: FileStore, romFile: string): Promise<Uint8Array | null> => files.readBytes(`assets/${datName(romFile)}`);
const writeDat = (files: FileStore, romFile: string, dat: Uint8Array): Promise<void> => files.writeBytes(`assets/${datName(romFile)}`, dat);
const readRomBytes = (files: FileStore, romFile: string): Promise<Uint8Array | null> => files.readBytes(`roms/${romFile}`);

/**
 * Every stored language set, with the font pair it bakes with — the extras for
 * one asset recompile, in the order the set list reports. Reads the EDITED set
 * files, so a translator's saved changes are what lands in the blob; a folder
 * missing either the set payload or its font pair is skipped as incomplete.
 * Compiling them is the caller's job (`compileSets`), since that runs off this
 * thread in the renderer.
 */
const readLanguageSets = async (files: FileStore): Promise<SetBakeInput[]> => {
  const out: SetBakeInput[] = [];
  for (const { id } of await listSets(files)) {
    const set = await getSet(files, id);
    const font = await getSetFont(files, id);
    if (!set || !font) continue;
    out.push({ set, fontData: font.fontData, fontWidth: font.fontWidth });
  }
  return out;
};

export { datName, check, load, writeDat, readRomBytes, readLanguageSets };
