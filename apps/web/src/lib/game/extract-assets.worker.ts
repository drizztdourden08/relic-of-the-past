/* @layer bridge-wasm @kind logic */
/**
 * Asset-extraction Web Worker. Runs the pure-TS pipeline (loadRomFromBuffer +
 * compileResources, baking in language packs) off the UI thread. Buffer/crypto/fs
 * are provided by vite-plugin-node-polyfills. Input/output are plain bytes; the
 * Buffers the pipeline needs are constructed here, post-polyfill.
 */
import { loadRomFromBuffer } from '@shared/asset-extraction/rom/rom-loader';
import { compileResources } from '@shared/asset-extraction/compile-resources';
import { buildPackedEntry } from '@shared/asset-extraction/text/build-language-entry';
import { dialogueTexts } from '@shared/asset-extraction/text/parse-dialogue-text';

interface LangInput { code: string; dialogueText: string; fontData: Uint8Array; fontWidth: Uint8Array }
interface ExtractRequest { romBytes: Uint8Array; languages: LangInput[] }

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent<ExtractRequest>) => void) | null;
  postMessage: (msg: unknown) => void;
};

ctx.onmessage = (e) => {
  const { romBytes, languages } = e.data;
  try {
    const rom = loadRomFromBuffer(Buffer.from(romBytes));
    const extraLanguages = languages.map((l) => buildPackedEntry({
      code: l.code,
      texts: dialogueTexts(l.dialogueText),
      fontData: Buffer.from(l.fontData),
      fontWidth: Buffer.from(l.fontWidth),
      index: 1,
    }));
    const dat = compileResources(rom, { extraLanguages });
    ctx.postMessage({ ok: true, dat: new Uint8Array(dat) });
  } catch (err) {
    ctx.postMessage({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
};
