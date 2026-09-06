/* @layer shared-storage @kind logic */
/**
 * Extracted-sprite storage over FileStore (sprites/<romStem>/*.png, the in-game
 * binaries beside them, and the debug/review JSON).
 */
import type { FileStore } from '@shared/platform';
import { CAPACITY_ICONS_FILE } from '@shared/asset-extraction/item-sprites/capacity-icons';
import { CURRENCY_SYMBOLS_FILE } from '@shared/asset-extraction/item-sprites/currency-symbols';
import { GEAR_ICONS_FILE } from '@shared/asset-extraction/item-sprites/gear-icons';
import { IN_GAME_BINARY_FILES } from '@shared/asset-extraction/item-sprites/in-game-binaries';
import { QUIVER_ICON_FILE } from '@shared/asset-extraction/item-sprites/quiver-icon';
import { EXTRACTION_STAMP_FILE, parseExtractionStamp } from '@shared/asset-extraction/item-sprites/extraction-stamp';
import { readJson, writeJson } from './json';

const dir = (romFile: string): string => `sprites/${romFile.replace(/\.(sfc|smc)$/i, '')}`;

const check = async (files: FileStore, romFile: string): Promise<{ extracted: boolean; count: number }> => {
  const count = (await files.list(dir(romFile))).filter((n) => n.endsWith('.png')).length;
  return { extracted: count > 0, count };
};

/** Every file an extraction of `defs` writes beside the stamp: the PNGs and the in-game binaries. */
const extractedFileNames = (defs: readonly { file: string }[]): string[] =>
  [...defs.map((def) => `${def.file}.png`), ...IN_GAME_BINARY_FILES];

/** The expected PNG names (`<file>.png`) that the ROM's extracted set does not hold. */
const missing = async (files: FileStore, romFile: string, expected: readonly string[]): Promise<string[]> => {
  const present = new Set(await files.list(dir(romFile)));
  return expected.filter((name) => !present.has(name));
};

const writeSprites = async (files: FileStore, romFile: string, buffers: { name: string; bytes: Uint8Array }[]): Promise<void> => {
  await files.remove(dir(romFile)); // clear stale before writing the fresh set
  for (const buf of buffers) await files.writeBytes(`${dir(romFile)}/${buf.name}`, buf.bytes);
};

const remove = async (files: FileStore, romFile: string): Promise<{ success: boolean; error?: string }> => {
  await files.remove(dir(romFile));
  return { success: true };
};

/** The in-game capacity icon binary of the ROM's set; null when the set predates it. */
const readCapacityIcons = (files: FileStore, romFile: string): Promise<Uint8Array | null> =>
  files.readBytes(`${dir(romFile)}/${CAPACITY_ICONS_FILE}`);

/** The in-game gear picture binary of the ROM's set; null when the set predates it. */
const readGearIcons = (files: FileStore, romFile: string): Promise<Uint8Array | null> =>
  files.readBytes(`${dir(romFile)}/${GEAR_ICONS_FILE}`);

/** The in-game quiver picture binary of the ROM's set; null when the set predates it. */
const readQuiverIcon = (files: FileStore, romFile: string): Promise<Uint8Array | null> =>
  files.readBytes(`${dir(romFile)}/${QUIVER_ICON_FILE}`);

/** The in-game shop price symbol binary of the ROM's set; null when the set predates it. */
const readCurrencySymbols = (files: FileStore, romFile: string): Promise<Uint8Array | null> =>
  files.readBytes(`${dir(romFile)}/${CURRENCY_SYMBOLS_FILE}`);

/** The content version the ROM's set was extracted with; null before it carried a stamp. */
const readStampVersion = async (files: FileStore, romFile: string): Promise<string | null> =>
  parseExtractionStamp(await files.readText(`${dir(romFile)}/${EXTRACTION_STAMP_FILE}`));

/**
 * Whether the ROM's set predates the extraction that emits `expected` at
 * `expectedVersion`: a file that extraction writes is absent while others are
 * there, or the stamp is missing or names another version (the definitions, a
 * drawing or the decoders changed since). A set holding NONE of the expected
 * files is NOT stale. That is the plain "never extracted" case, which the
 * caller answers by extracting instead of by refreshing.
 */
const isStale = async (
  files: FileStore, romFile: string, expected: readonly string[], expectedVersion: string,
): Promise<boolean> => {
  const absent = await missing(files, romFile, expected);
  if (absent.length === expected.length) return false;
  if (absent.length > 0) return true;
  return (await readStampVersion(files, romFile)) !== expectedVersion;
};

const loadDebug = (files: FileStore) => readJson<Record<string, unknown>>(files, 'sprite-debug.json', {});
const saveDebug = (files: FileStore, data: unknown) => writeJson(files, 'sprite-debug.json', data);
const loadReview = (files: FileStore) => readJson<Record<string, unknown>>(files, 'sprite-review.json', {});
const saveReview = (files: FileStore, data: unknown) => writeJson(files, 'sprite-review.json', data);

export {
  check, extractedFileNames, isStale, missing, writeSprites, remove, readCapacityIcons, readCurrencySymbols, readGearIcons,
  readQuiverIcon, readStampVersion,
  loadDebug, saveDebug, loadReview, saveReview,
};
