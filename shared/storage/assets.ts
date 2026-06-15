/* @layer shared-storage @kind logic */
/**
 * Asset blob (.dat) storage over FileStore + the inputs the extraction Worker needs.
 * The compile itself runs in a renderer Worker (Node-Buffer pipeline); this module
 * only does the FileStore I/O (read ROM + language packs, write the .dat).
 */
import type { FileStore } from '@shared/platform';

interface LanguageInput {
  code: string;
  dialogueText: string;
  fontData: Uint8Array;
  fontWidth: Uint8Array;
}

const datName = (romFile: string): string => romFile.replace(/\.(sfc|smc)$/i, '.dat');

const check = async (files: FileStore, romFile: string): Promise<boolean> => {
  const stat = await files.stat(`assets/${datName(romFile)}`);
  return !!stat && stat.bytes > 0;
};

const load = (files: FileStore, romFile: string): Promise<Uint8Array | null> => files.readBytes(`assets/${datName(romFile)}`);
const writeDat = (files: FileStore, romFile: string, dat: Uint8Array): Promise<void> => files.writeBytes(`assets/${datName(romFile)}`, dat);
const readRomBytes = (files: FileStore, romFile: string): Promise<Uint8Array | null> => files.readBytes(`roms/${romFile}`);

// Every complete language pack's raw inputs, ready to bake into the asset blob.
const readLanguageInputs = async (files: FileStore): Promise<LanguageInput[]> => {
  const out: LanguageInput[] = [];
  for (const code of await files.list('languages')) {
    const meta = await files.readText(`languages/${code}/meta.json`);
    if (meta == null) continue; // incomplete pack
    const dialogueText = await files.readText(`languages/${code}/dialogue.txt`);
    const fontData = await files.readBytes(`languages/${code}/font.bin`);
    const fontWidth = await files.readBytes(`languages/${code}/font-width.bin`);
    if (dialogueText == null || !fontData || !fontWidth) continue;
    out.push({ code, dialogueText, fontData, fontWidth });
  }
  return out;
};

export { datName, check, load, writeDat, readRomBytes, readLanguageInputs };
export type { LanguageInput };
