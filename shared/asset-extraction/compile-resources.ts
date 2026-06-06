/* @layer shared-asset-extraction @kind logic */
/**
 * Compile resources — produces zelda3_assets.dat from ROM data.
 * This is the final pipeline stage that assembles all game assets into a binary file.
 *
 * Ported from: core/zelda3/assets/compile_resources.py
 */
import type { RomData } from './rom/rom-types';
import { AssetBuilder } from './asset-builder';
import { buildSpriteGfx, buildBgGfx, buildLinkGraphics, buildMisc, buildMap32ToMap16, buildTilemaps } from './compile-graphics';
import { buildOverworldCompressed, buildOverworldTables } from './compile-overworld';
import { buildDungeonRooms, buildDefaultAndOverlayRooms, buildDungeonSecrets, buildDungeonAttrs, buildEnemyDamageData, buildDungeonSprites, buildDungeonMap } from './compile-dungeons';
import { buildDialogue } from './compile-dialogue';
import { buildSoundBanks } from './compile-sound';

interface CompileOptions {
  /** If true, skip dialogue (requires language extraction) */
  skipDialogue?: boolean;
  /** If true, skip sound banks (requires music compiler) */
  skipMusic?: boolean;
}

const compileResources = (rom: RomData, options: CompileOptions = {}): Buffer => {
  const A = new AssetBuilder();

  if (!options.skipMusic) buildSoundBanks(rom, A);
  buildDungeonRooms(rom, A);
  buildDefaultAndOverlayRooms(rom, A);
  buildDungeonSecrets(rom, A);
  buildDungeonAttrs(rom, A);
  buildEnemyDamageData(rom, A);
  buildLinkGraphics(rom, A);
  buildDungeonSprites(rom, A);
  buildMap32ToMap16(rom, A);
  buildSpriteGfx(rom, A);
  buildBgGfx(rom, A);
  buildMisc(rom, A);
  if (!options.skipDialogue) buildDialogue(rom, A);
  buildDungeonMap(rom, A);
  buildTilemaps(rom, A);
  buildOverworldCompressed(rom, A);
  buildOverworldTables(rom, A);

  return A.serialize();
};

export { compileResources };
export type { CompileOptions };
