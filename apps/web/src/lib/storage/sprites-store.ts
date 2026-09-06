/* @layer renderer-lib @kind logic */
/**
 * Renderer sprites store: check/delete/debug/review over FileStore, base URL via
 * the platform (app-sprite:// / convertFileSrc), and extraction via the Worker
 * (pure pipeline → PNG buffers → FileStore). Mirrors the window.api sprite surface.
 */
import * as sprites from '@shared/storage/sprites';
import type { SpriteDef, SpriteBuffer } from '@shared/asset-extraction/item-sprites/extract-items';
import { extractionVersionOf } from '@shared/asset-extraction/item-sprites/extraction-stamp';
import { SPRITE_DEFINITIONS } from '@shared/game/data/sprite-manifest/manifest';
import { getPlatform } from '@app/platform/get-platform';
import { runOnWorker } from './extraction-client';
import { publishImportProgress } from './import-progress-bus';

const files = () => getPlatform().files;
const DEFS = SPRITE_DEFINITIONS as unknown as SpriteDef[];

const checkSpritesExtracted = (romFile: string) => sprites.check(files(), romFile);
const deleteSprites = (romFile: string) => sprites.remove(files(), romFile);
const getSpritesBaseUrl = (romFile: string): Promise<string> => getPlatform().storage.spritesBaseUrl(romFile);
const loadSpriteDebug = () => sprites.loadDebug(files());
const saveSpriteDebug = (data: unknown) => sprites.saveDebug(files(), data);
const loadSpriteReview = () => sprites.loadReview(files());
const saveSpriteReview = (data: unknown) => sprites.saveReview(files(), data);

/** True when this build can extract at all: a build without definitions emits nothing. */
const hasSpriteDefinitions = (): boolean => DEFS.length > 0;

/** The content version this build's extraction writes; what a fresh set's stamp must name. */
const expectedSpritesVersion = (): string => extractionVersionOf(DEFS);

/** The content version the ROM's extracted set carries, or null before it was stamped. */
const readSpritesVersion = (romFile: string): Promise<string | null> => sprites.readStampVersion(files(), romFile);

/** Every file a current extraction writes beside the stamp. */
const expectedSpriteFiles = (): string[] => sprites.extractedFileNames(DEFS);

/**
 * Whether the extracted set predates the current extraction, with the rule itself
 * lives in the shared store (sprites.isStale); this only supplies what THIS
 * build emits. A build with no definitions extracts nothing, so it can never
 * call a set stale.
 */
const checkSpritesStale = async (romFile: string): Promise<boolean> => {
  if (!hasSpriteDefinitions()) return false;
  return sprites.isStale(files(), romFile, expectedSpriteFiles(), expectedSpritesVersion());
};

/** The in-game capacity icon binary of the ROM's extracted set, or null before it exists. */
const readCapacityIcons = (romFile: string): Promise<Uint8Array | null> => sprites.readCapacityIcons(files(), romFile);

/** The in-game gear picture binary of the ROM's extracted set, or null before it exists. */
const readGearIcons = (romFile: string): Promise<Uint8Array | null> => sprites.readGearIcons(files(), romFile);

/** The in-game quiver picture binary of the ROM's extracted set, or null before it exists. */
const readQuiverIcon = (romFile: string): Promise<Uint8Array | null> => sprites.readQuiverIcon(files(), romFile);

/** The in-game shop price symbol binary of the ROM's extracted set, or null before it exists. */
const readCurrencySymbols = (romFile: string): Promise<Uint8Array | null> =>
  sprites.readCurrencySymbols(files(), romFile);

const extractSprites = async (romFile: string): Promise<{ success: boolean; count?: number; error?: string }> => {
  try {
    const romBytes = await files().readBytes(`roms/${romFile}`);
    if (!romBytes) return { success: false, error: `ROM file not found: ${romFile}` };
    publishImportProgress({ kind: 'sprite', id: romFile, phase: 'decode', message: 'Extracting sprites...' });
    const result = await runOnWorker<{ buffers: SpriteBuffer[]; errors: string[] }>({ op: 'sprites', romBytes, defs: DEFS });
    await sprites.writeSprites(files(), romFile, result.buffers);
    publishImportProgress({ kind: 'sprite', id: romFile, phase: 'done' });
    return { success: true, count: result.buffers.length };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    publishImportProgress({ kind: 'sprite', id: romFile, phase: 'error', message: msg });
    return { success: false, error: msg };
  }
};

export {
  checkSpritesExtracted, checkSpritesStale, deleteSprites, expectedSpriteFiles, expectedSpritesVersion,
  getSpritesBaseUrl, extractSprites, hasSpriteDefinitions, loadSpriteDebug, readCapacityIcons, readCurrencySymbols,
  readGearIcons, readQuiverIcon, readSpritesVersion, saveSpriteDebug, loadSpriteReview, saveSpriteReview,
};
