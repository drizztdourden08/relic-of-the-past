/* @layer bridge-wasm @kind logic */
/**
 * Extraction Web Worker — runs the pure-TS pipeline off the UI thread (Buffer/
 * crypto/fs polyfilled by vite-plugin-node-polyfills). Handles asset compilation
 * and per-language extraction. Inputs/outputs are plain bytes; Buffers are built here.
 */
import { loadRomFromBuffer } from '@shared/asset-extraction/rom/rom-loader';
import { loadGbaAlttpRomFromBuffer } from '@shared/asset-extraction/rom/gba-rom';
import {
  decodeCredits, decodeEndingCaptions, decodeMenuText,
} from '@shared/asset-extraction/text/menu-text';
import { compileAlttpAssetSet } from '@shared/asset-extraction/compile-alttp-asset-set';
import { extractLangEntry } from '@shared/asset-extraction/text/build-language-entry';
import { compileSets } from '@shared/game/language';
import type { SetBakeInput } from '@shared/game/language';
import { extractSpriteBuffers, type SpriteDef } from '@shared/asset-extraction/item-sprites/extract-items';
import type { AssetSourceId } from '@shared/asset-extraction/sources/source-ids';

type SupplementRoms = Partial<Record<AssetSourceId, Uint8Array>>;
type Req =
  | { op: 'assets'; romBytes: Uint8Array; supplementRoms?: SupplementRoms; languages: SetBakeInput[] }
  | { op: 'language'; romBytes: Uint8Array; code: string }
  | { op: 'sprites'; romBytes: Uint8Array; defs: SpriteDef[] }
  | { op: 'menu-text'; romBytes: Uint8Array };

interface AssetsResult {
  base: Uint8Array;
  sidecars: { id: AssetSourceId; bytes: Uint8Array }[];
  /** Optional sources that failed. The base is still valid; the UI surfaces these. */
  failures: { id: AssetSourceId; reason: string }[];
}

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent<Req>) => void) | null;
  postMessage: (msg: unknown) => void;
};

// This is the ONLY place the asset blob is compiled. An Electron-main copy used to exist
// alongside it and drifted — it learned about the second cartridge while this one, the path
// the app actually runs, did not. Keep it that way: one compile, every platform.
const runAssets = async (
  romBytes: Uint8Array, supplementRoms: SupplementRoms, languages: SetBakeInput[],
): Promise<AssetsResult> => {
  const extraLanguages = compileSets(languages, (message) => console.warn(`[assets] ${message}`));
  const gbaBytes = supplementRoms['gba-alttp'];
  const gbaRom = gbaBytes ? loadGbaAlttpRomFromBuffer(Buffer.from(gbaBytes)) : undefined;
  const set = await compileAlttpAssetSet({
    snes: loadRomFromBuffer(Buffer.from(romBytes)),
    gbaAlttp: gbaRom,
  }, { extraLanguages });

  return {
    base: new Uint8Array(set.base),
    sidecars: set.supplements.flatMap((s) => (s.ok ? [{ id: s.id, bytes: new Uint8Array(s.container) }] : [])),
    failures: set.supplements.flatMap((s) => (s.ok ? [] : [{ id: s.id, reason: s.reason }])),
  };
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
  const respond = async (): Promise<unknown> => {
    const req = e.data;
    if (req.op === 'assets') return runAssets(req.romBytes, req.supplementRoms ?? {}, req.languages);
    if (req.op === 'language') return runLanguage(req.romBytes, req.code);
    if (req.op === 'menu-text') return runMenuText(req.romBytes);
    return runSprites(req.romBytes, req.defs);
  };
  respond()
    .then(result => ctx.postMessage({ ok: true, result }))
    .catch((err: unknown) => ctx.postMessage({ ok: false, error: err instanceof Error ? err.message : String(err) }));
};
