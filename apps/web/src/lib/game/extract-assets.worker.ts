/* @layer bridge-wasm @kind logic */
/**
 * Extraction Web Worker — runs the pure-TS pipeline off the UI thread (Buffer/
 * crypto/fs polyfilled by vite-plugin-node-polyfills). Handles asset compilation
 * and per-language extraction. Inputs/outputs are plain bytes; Buffers are built here.
 */
import { loadRomFromBuffer } from '@shared/asset-extraction/rom/rom-loader';
import {
  decodeCredits, decodeEndingCaptions, decodeMenuText,
} from '@shared/asset-extraction/text/menu-text';
import { compileResources } from '@shared/asset-extraction/compile-resources';
import { extractLangEntry } from '@shared/asset-extraction/text/build-language-entry';
import { compileSets } from '@shared/game/language';
import type { SetBakeInput } from '@shared/game/language';
import { extractSpriteBuffers, type SpriteDef } from '@shared/asset-extraction/item-sprites/extract-items';

type Req =
  | { op: 'assets'; romBytes: Uint8Array; languages: SetBakeInput[] }
  | { op: 'language'; romBytes: Uint8Array; code: string }
  | { op: 'sprites'; romBytes: Uint8Array; defs: SpriteDef[] }
  | { op: 'menu-text'; romBytes: Uint8Array };

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent<Req>) => void) | null;
  postMessage: (msg: unknown) => void;
};

const runAssets = (romBytes: Uint8Array, languages: SetBakeInput[]): Uint8Array => {
  const rom = loadRomFromBuffer(Buffer.from(romBytes));
  const extraLanguages = compileSets(languages, (message) => console.warn(`[assets] ${message}`));
  return new Uint8Array(compileResources(rom, { extraLanguages }));
};

const runLanguage = (romBytes: Uint8Array, code: string) => {
  const rom = loadRomFromBuffer(Buffer.from(romBytes), true);
  if (rom.language !== code) {
    throw new Error(`Selected '${code}' but this ROM is '${rom.language}' (${rom.description}). Pick the matching language.`);
  }
  const entry = extractLangEntry(rom, rom.language, 1);
  return {
    code: rom.language,
    description: rom.description,
    dialogue: `${entry.lines.map((l) => `${l.id}: ${l.content}`).join('\n')}\n`,
    fontData: new Uint8Array(entry.fontData),
    fontWidth: new Uint8Array(entry.fontWidth),
    glyphCount: entry.glyphCount,
    lineCount: entry.lineCount,
    encoder: entry.encoder,
    flags: entry.flags,
  };
};

const runSprites = (romBytes: Uint8Array, defs: SpriteDef[]) =>
  extractSpriteBuffers(loadRomFromBuffer(Buffer.from(romBytes)), defs);

/*
 * The menu, credits and closing captions. The extractor copies these bodies
 * into the blob without decoding them, so the studio reads them straight from
 * the player's own file — here, off the UI thread, because reaching them means
 * parsing a whole ROM.
 */
const runMenuText = (romBytes: Uint8Array) => {
  const rom = loadRomFromBuffer(Buffer.from(romBytes), true);
  // Decoded through the ROM'S OWN alphabet, never a requested one: reading these
  // glyphs against the wrong language yields nonsense rather than nothing. The
  // caller is told which language answered and decides what to do about it.
  const code = rom.language;
  return {
    language: code,
    menu: decodeMenuText(rom, code),
    credits: [...decodeCredits(rom), ...decodeEndingCaptions(rom)],
  };
};

ctx.onmessage = (e) => {
  try {
    const req = e.data;
    const result = req.op === 'assets' ? runAssets(req.romBytes, req.languages)
      : req.op === 'language' ? runLanguage(req.romBytes, req.code)
        : req.op === 'menu-text' ? runMenuText(req.romBytes)
          : runSprites(req.romBytes, req.defs);
    ctx.postMessage({ ok: true, result });
  } catch (err) {
    ctx.postMessage({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
};
