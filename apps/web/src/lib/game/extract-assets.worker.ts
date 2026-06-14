/* @layer bridge-wasm @kind logic */
/**
 * Extraction Web Worker — runs the pure-TS pipeline off the UI thread (Buffer/
 * crypto/fs polyfilled by vite-plugin-node-polyfills). Handles asset compilation
 * and per-language extraction. Inputs/outputs are plain bytes; Buffers are built here.
 */
import { loadRomFromBuffer } from '@shared/asset-extraction/rom/rom-loader';
import { compileResources } from '@shared/asset-extraction/compile-resources';
import { buildPackedEntry, extractLangEntry } from '@shared/asset-extraction/text/build-language-entry';
import { dialogueTexts } from '@shared/asset-extraction/text/parse-dialogue-text';
import { extractSpriteBuffers, type SpriteDef } from '@shared/asset-extraction/item-sprites/extract-items';

interface LangInput { code: string; dialogueText: string; fontData: Uint8Array; fontWidth: Uint8Array }
type Req =
  | { op: 'assets'; romBytes: Uint8Array; languages: LangInput[] }
  | { op: 'language'; romBytes: Uint8Array; code: string }
  | { op: 'sprites'; romBytes: Uint8Array; defs: SpriteDef[] };

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent<Req>) => void) | null;
  postMessage: (msg: unknown) => void;
};

const runAssets = (romBytes: Uint8Array, languages: LangInput[]): Uint8Array => {
  const rom = loadRomFromBuffer(Buffer.from(romBytes));
  const extraLanguages = languages.map((l) => buildPackedEntry({
    code: l.code,
    texts: dialogueTexts(l.dialogueText),
    fontData: Buffer.from(l.fontData),
    fontWidth: Buffer.from(l.fontWidth),
    index: 1,
  }));
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

ctx.onmessage = (e) => {
  try {
    const req = e.data;
    const result = req.op === 'assets' ? runAssets(req.romBytes, req.languages)
      : req.op === 'language' ? runLanguage(req.romBytes, req.code)
        : runSprites(req.romBytes, req.defs);
    ctx.postMessage({ ok: true, result });
  } catch (err) {
    ctx.postMessage({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
};
