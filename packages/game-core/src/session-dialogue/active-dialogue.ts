/* @layer bridge-wasm @kind logic */
import { findDatAsset, unpackPackedBytes } from '@rotp/asset-extraction';
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

const dialogueIndexOf = (dialogueMap: Uint8Array, code: string): number => {
  for (const entry of unpackPackedBytes(dialogueMap)) {
    const [codeBytes, conf] = unpackPackedBytes(entry);
    const dialogueIndex = conf?.[0];
    if (codeBytes === undefined || conf === undefined || conf.length < 3 || dialogueIndex === undefined) continue;
    if (new TextDecoder().decode(codeBytes) === code) return dialogueIndex;
  }
  return 0;
};

const readActiveDialogue = (mod: EmscriptenModule): ActiveDialogue | null => {
  let dat: Uint8Array;
  try {
    dat = mod.FS.readFile('/zelda3_assets.dat');
  } catch {
    return null;
  }
  const dialogueAsset = findDatAsset(dat, 'kDialogue');
  const mapAsset = findDatAsset(dat, 'kDialogueMap');
  const fontAsset = findDatAsset(dat, 'kDialogueFont');
  if (dialogueAsset === undefined || mapAsset === undefined || fontAsset === undefined) return null;

  const code = activeLanguageCode(mod);
  const index = dialogueIndexOf(mapAsset, code);
  const langData = unpackPackedBytes(dialogueAsset)[index];
  const fontPacked = unpackPackedBytes(fontAsset)[index];
  if (langData === undefined || fontPacked === undefined) return null;

  const [dictPacked, dialoguePacked] = unpackPackedBytes(langData);
  const fontWidths = unpackPackedBytes(fontPacked)[1];
  if (dictPacked === undefined || dialoguePacked === undefined || fontWidths === undefined) return null;

  return { code, dictPacked, lineChunks: unpackPackedBytes(dialoguePacked), fontWidths };
};

export { readActiveDialogue };
export type { ActiveDialogue } from './active-dialogue.type';
