/* @layer shared-asset-extraction @kind logic */
import { buildInGameBinaries } from '../in-game-binaries';
import { extractionStampBuffer } from '../extraction-stamp';
import { createExtractionContext } from './create-extraction-context';
import { extractByFile } from './extract-by-file';
import { PNG_SCALE } from './extract-items.constants';
import type { RomData } from '../../rom/rom-types';
import type { ImageBuffer } from '../../graphics/png-writer';
import type { SpriteBuffer, SpriteBuffersResult, SpriteCounts, SpriteDef } from './extract-items.type';

const extractSpriteBuffers = (rom: RomData, allSprites: SpriteDef[]): SpriteBuffersResult => {
  const ctx = createExtractionContext(rom, allSprites);

  const counts: SpriteCounts = { hud: 0, 'hud-pause': 0, 'hud-item': 0, fonts: 0, receipt: 0, drop: 0, randomizer: 0, title: 0, ground: 0 };
  const errors: string[] = [];
  const buffers: SpriteBuffer[] = [extractionStampBuffer(allSprites)];
  const pictures = new Map<string, ImageBuffer>();

  for (const spriteDef of allSprites) {
    try {
      const img = extractByFile(spriteDef.file, ctx);
      if (!img) { errors.push(`${spriteDef.file}: extraction returned null`); continue; }
      pictures.set(spriteDef.file, img);
      const scaled = img.scale(PNG_SCALE);
      buffers.push({ name: `${spriteDef.file}.png`, bytes: new Uint8Array(scaled.toPngBuffer()) });
      counts[spriteDef.category] += 1;
    } catch (e) {
      errors.push(`${spriteDef.file}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const binaries = buildInGameBinaries(pictures, new Set(ctx.byFile.keys()), ctx.spritePalettes.palettes);
  buffers.push(...binaries.buffers);
  errors.push(...binaries.errors);

  return { buffers, counts, errors };
};

export { extractSpriteBuffers };
