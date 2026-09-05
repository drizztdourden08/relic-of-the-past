/* @layer renderer-lib @kind logic */
/**
 * Renderer sprites store: check/delete/debug/review over FileStore, base URL via
 * the platform (app-sprite:// / convertFileSrc), and extraction via the Worker
 * (pure pipeline → PNG buffers → FileStore). Mirrors the window.api sprite surface.
 */
import * as sprites from '@shared/storage/sprites';
import type { SpriteDef, SpriteBuffer } from '@shared/asset-extraction/item-sprites/extract-items';
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
  checkSpritesExtracted, deleteSprites, getSpritesBaseUrl, extractSprites,
  loadSpriteDebug, saveSpriteDebug, loadSpriteReview, saveSpriteReview,
};
