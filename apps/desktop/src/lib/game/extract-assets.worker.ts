/* @layer bridge-wasm @kind logic */
import { loadRomFromBuffer } from '@shared/asset-extraction/rom/rom-loader';
import { loadGbaAlttpRomFromBuffer } from '@shared/asset-extraction/rom/gba-rom';
import {
  decodeCredits, decodeEndingCaptions, decodeMenuText,
} from '@shared/asset-extraction/text/menu-text';
import { compileAlttpAssetSet } from '@shared/asset-extraction/compile-alttp-asset-set';
import { extractLangEntry } from '@shared/asset-extraction/text/build-language-entry';
import { compileSets } from '@shared/game/language';
import type { SetBakeInput } from '@shared/game/language';
import { extractSpriteBuffers } from '@shared/asset-extraction/item-sprites/extract-items';
import type { SpriteDef } from '@shared/asset-extraction/item-sprites/extract-items';
import type { AssetsResult, SupplementRoms, WorkerScope } from './extract-assets.worker.type';

const ctx = self as unknown as WorkerScope;

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
    if (req.op === 'assets') return runAssets(req.romBytes, req.supplementRoms ?? {}, req.languages);
    if (req.op === 'language') return runLanguage(req.romBytes, req.code);
    if (req.op === 'menu-text') return runMenuText(req.romBytes);
    return runSprites(req.romBytes, req.defs);
  };
  respond()
    .then(result => ctx.postMessage({ ok: true, result }))
    .catch((err: unknown) => ctx.postMessage({ ok: false, error: err instanceof Error ? err.message : String(err) }));
};
