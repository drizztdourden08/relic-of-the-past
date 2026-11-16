/* @layer bridge-wasm @kind logic */
import { decodeLetterList, findDatAsset, unpackPackedBytes } from '@rotp/asset-extraction';
import { dialogueMapEntryOf } from './dialogue-map-entry';
import type { EmscriptenModule } from '../types';
import type { ActiveDialogue } from './active-dialogue.type';

const activeLanguageCode = (mod: EmscriptenModule): string => {
  try {
    const ini = new TextDecoder().decode(mod.FS.readFile('/zelda3.ini'));
    return /^\s*Language\s*=\s*(\S+)/m.exec(ini)?.[1] ?? 'us';
  } catch {
    return 'us';
  }
};

const readAssetFile = (mod: EmscriptenModule): Uint8Array | null => {
  try {
    return mod.FS.readFile('/zelda3_assets.dat');
  } catch {
    return null;
  }
};

const languageParts = (
  dialogueAsset: Uint8Array,
  fontAsset: Uint8Array,
  index: number,
): Omit<ActiveDialogue, 'code'> | null => {
  const langData = unpackPackedBytes(dialogueAsset)[index];
  const fontPacked = unpackPackedBytes(fontAsset)[index];
  if (langData === undefined || fontPacked === undefined) return null;

  const [dictPacked, dialoguePacked, lettersPacked] = unpackPackedBytes(langData);
  const [fontSheet, fontWidths] = unpackPackedBytes(fontPacked);
  if (dictPacked === undefined || dialoguePacked === undefined) return null;
  if (fontSheet === undefined || fontWidths === undefined) return null;

  const bakedLetters = decodeLetterList(lettersPacked);
  return { dictPacked, lineChunks: unpackPackedBytes(dialoguePacked), fontSheet, fontWidths, bakedLetters };
};

const readActiveDialogue = (mod: EmscriptenModule): ActiveDialogue | null => {
  const dat = readAssetFile(mod);
  if (dat === null) return null;
  const dialogueAsset = findDatAsset(dat, 'kDialogue');
  const mapAsset = findDatAsset(dat, 'kDialogueMap');
  const fontAsset = findDatAsset(dat, 'kDialogueFont');
  if (dialogueAsset === undefined || mapAsset === undefined || fontAsset === undefined) return null;

  const { index, base } = dialogueMapEntryOf(mapAsset, activeLanguageCode(mod));
  const parts = languageParts(dialogueAsset, fontAsset, index);
  return parts === null ? null : { code: base, ...parts };
};

export { readActiveDialogue };
