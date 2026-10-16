/* @layer bridge-wasm @kind logic */
import { decodeCredits, decodeEndingCaptions, decodeMenuText, extractLangEntry, extractSpriteBuffers } from '@rotp/asset-extraction';
import { loadRomFromBuffer } from '@rotp/asset-extraction/buffer';
import type { SpriteDef } from '@rotp/asset-extraction';
import { bakeAssetSet } from '../storage/asset-files/bake-asset-set';
import type { WorkerScope } from './extract-assets-worker.type';

const ctx: WorkerScope = self;

const warnAssets = (message: string): void => ctx.postMessage({ warn: `[assets] ${message}` });

const runLanguage = (romBytes: Uint8Array) => {
  const rom = loadRomFromBuffer(Buffer.from(romBytes), true);
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

const runMenuText = (romBytes: Uint8Array) => {
  const rom = loadRomFromBuffer(Buffer.from(romBytes), true);
  const romOwnLanguage = rom.language;
  return {
    language: romOwnLanguage,
    menu: decodeMenuText(rom, romOwnLanguage),
    credits: [...decodeCredits(rom), ...decodeEndingCaptions(rom)],
  };
};

ctx.onmessage = (e) => {
  const respond = async (): Promise<unknown> => {
    const req = e.data;
    if (req.op === 'assets') return bakeAssetSet({ romBytes: req.romBytes, supplementRoms: req.supplementRoms ?? {}, languages: req.languages }, warnAssets);
    if (req.op === 'language') return runLanguage(req.romBytes);
    if (req.op === 'menu-text') return runMenuText(req.romBytes);
    return runSprites(req.romBytes, req.defs);
  };
  respond()
    .then(result => ctx.postMessage({ ok: true, result }))
    .catch((err: unknown) => ctx.postMessage({ ok: false, error: err instanceof Error ? err.message : String(err) }));
};
