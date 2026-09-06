/* @layer bridge-wasm @kind logic */
/**
 * Active-language dialogue view: reads the asset blob and INI back from the
 * running module's virtual FS and extracts, at the byte level, exactly what
 * the session-dialogue composer needs: the active language's code, its packed
 * dictionary, its per-line compressed chunks, and its per-glyph pixel widths.
 * Byte-level reuse means the vanilla lines are never re-encoded, so the composed
 * blob carries them bit-identical to the bake.
 */

import { findDatAsset } from '@shared/asset-extraction/dat-container';
import { unpackPackedBytes } from '@shared/asset-extraction/packed-bytes';
import type { EmscriptenModule } from '../types';

interface ActiveDialogue {
  /** Language code the core selected at boot (INI `Language`, default us). */
  code: string;
  /** The language's packed dictionary bytes, reused verbatim. */
  dictPacked: Uint8Array;
  /** One compressed chunk per dialogue line, in message-id order. */
  lineChunks: Uint8Array[];
  /** Per-glyph pixel widths (indexed by alphabet position), for wrapping. */
  fontWidths: Uint8Array;
}

/** Mirrors the core's boot-time INI read (absent key = default language). */
const activeLanguageCode = (mod: EmscriptenModule): string => {
  try {
    const ini = new TextDecoder().decode(mod.FS.readFile('/zelda3.ini'));
    return /^\s*Language\s*=\s*(\S+)/m.exec(ini)?.[1] ?? 'us';
  } catch {
    return 'us';
  }
};

/** ZeldaSetLanguage's lookup, in TS: dialogue-array index for |code|, default 0. */
const dialogueIndexOf = (dialogueMap: Uint8Array, code: string): number => {
  for (const entry of unpackPackedBytes(dialogueMap)) {
    const [codeBytes, conf] = unpackPackedBytes(entry);
    if (codeBytes === undefined || conf === undefined || conf.length < 3) continue;
    if (new TextDecoder().decode(codeBytes) === code) return conf[0];
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
export type { ActiveDialogue };
