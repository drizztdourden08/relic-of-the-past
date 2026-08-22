/* @layer bridge-wasm @kind logic */
/**
 * Extraction Web Worker — runs the pure-TS pipeline off the UI thread (Buffer/
 * crypto/fs polyfilled by vite-plugin-node-polyfills). Handles asset compilation
 * and per-language extraction. Inputs/outputs are plain bytes; Buffers are built here.
 */
import { loadRomFromBuffer } from '@shared/asset-extraction/rom/rom-loader';
import { loadGbaAlttpRomFromBuffer } from '@shared/asset-extraction/rom/gba-rom';
import { compileAlttpAssetSet } from '@shared/asset-extraction/compile-alttp-asset-set';
import { buildPackedEntry, extractLangEntry } from '@shared/asset-extraction/text/build-language-entry';
import { dialogueTexts } from '@shared/asset-extraction/text/parse-dialogue-text';
import { extractSpriteBuffers, type SpriteDef } from '@shared/asset-extraction/item-sprites/extract-items';
import type { AssetSourceId } from '@shared/asset-extraction/sources/source-ids';

interface LangInput { code: string; dialogueText: string; fontData: Uint8Array; fontWidth: Uint8Array }
type SupplementRoms = Partial<Record<AssetSourceId, Uint8Array>>;
type Req =
  | { op: 'assets'; romBytes: Uint8Array; supplementRoms?: SupplementRoms; languages: LangInput[] }
  | { op: 'language'; romBytes: Uint8Array; code: string }
  | { op: 'sprites'; romBytes: Uint8Array; defs: SpriteDef[] };

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
const runAssets = (romBytes: Uint8Array, supplementRoms: SupplementRoms, languages: LangInput[]): AssetsResult => {
  const extraLanguages = languages.map((l) => buildPackedEntry({
    code: l.code,
    texts: dialogueTexts(l.dialogueText),
    fontData: Buffer.from(l.fontData),
    fontWidth: Buffer.from(l.fontWidth),
    index: 1,
  }));

  const gbaBytes = supplementRoms['gba-alttp'];
  const set = compileAlttpAssetSet({
    snes: loadRomFromBuffer(Buffer.from(romBytes)),
    gbaAlttp: gbaBytes ? loadGbaAlttpRomFromBuffer(Buffer.from(gbaBytes)) : undefined,
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

ctx.onmessage = (e) => {
  try {
    const req = e.data;
    const result = req.op === 'assets' ? runAssets(req.romBytes, req.supplementRoms ?? {}, req.languages)
      : req.op === 'language' ? runLanguage(req.romBytes, req.code)
        : runSprites(req.romBytes, req.defs);
    ctx.postMessage({ ok: true, result });
  } catch (err) {
    ctx.postMessage({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
};
