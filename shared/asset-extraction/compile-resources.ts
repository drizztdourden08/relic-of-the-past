/* @layer shared-asset-extraction @kind logic */
import type { RomData } from './rom/rom-types';
import { AssetBuilder } from './asset-builder';
import { buildSpriteGfx, buildBgGfx, buildPlayerGraphics, buildMisc, buildMap32ToMap16, buildTilemaps } from './compile-graphics';
import { buildOverworldCompressed, buildOverworldTables } from './compile-overworld';
import { buildDungeonRooms, buildDefaultAndOverlayRooms, buildDungeonSecrets, buildDungeonAttrs, buildEnemyDamageData, buildDungeonSprites, buildDungeonMap } from './compile-dungeons';
import { buildDialogue } from './compile-dialogue';
import { buildSoundBanks } from './compile-sound';
import type { CompileOptions } from './compile-resources.type';

const compileResources = (rom: RomData, options: CompileOptions = {}): Buffer => {
  const A = new AssetBuilder();

  if (!options.skipMusic) buildSoundBanks(rom, A);
  buildDungeonRooms(rom, A);
  buildDefaultAndOverlayRooms(rom, A);
  buildDungeonSecrets(rom, A);
  buildDungeonAttrs(rom, A);
  buildEnemyDamageData(rom, A);
  buildPlayerGraphics(rom, A);
  buildDungeonSprites(rom, A);
  buildMap32ToMap16(rom, A);
  buildSpriteGfx(rom, A);
  buildBgGfx(rom, A);
  buildMisc(rom, A);
  if (!options.skipDialogue) buildDialogue(rom, A, options.extraLanguages);
  buildDungeonMap(rom, A);
  buildTilemaps(rom, A);
  buildOverworldCompressed(rom, A);
  buildOverworldTables(rom, A);

  return A.serialize();
};

export { compileResources };
export type { CompileOptions };
