/* @layer shared-game @kind logic */
/**
 * The intrinsic SNES-px box an extraction recipe cuts. It is derived from the same
 * `extract` recipe the extraction pipeline itself reads (`extract-items.ts`'s
 * own `EXTRACTORS` table), never authored by hand. A HUD author should never
 * be asked what shape a sprite's art is: the extractor already knows, because
 * it is the thing that decided it.
 *
 * Undefined for every method whose decoder always produces the fallback
 * 16x16 canvas (`hud-tiles`, `hud-special`, `bg-tile`, `receipt*`, `drop-*`,
 * `follower-bomb`, `art`, a paired `dialogue-glyph`), because `intrinsic-size.ts`'s
 * own 16x16 default already covers those, so this only has an opinion where
 * the cut really differs: a single tile (`hud-single`, 8x8), a run of tiles
 * (`hud-strip`/`hud-vstrip`, 8px per tile and cropped to `width` when given),
 * and an unpaired dialogue glyph (8x16, `dialogue-glyph-decoder.ts`'s own
 * `GLYPH_W`/`GLYPH_H`).
 */
import type { SpriteDefinition } from './manifest';

interface SpriteBox { w: number; h: number }

/** `dialogue-glyph-decoder.ts`'s own constants, kept in step by hand since
 *  importing that module here would pull ROM-decoding code into pure data. */
const GLYPH_W = 8;
const GLYPH_H = 16;

interface ExtractShape {
  method?: string;
  tiles?: number[];
  width?: number;
  glyphRight?: number;
}

const boxForExtract = (extract: SpriteDefinition['extract']): SpriteBox | undefined => {
  const def = extract as ExtractShape;
  switch (def.method) {
    case 'hud-single':
      return { w: 8, h: 8 };
    case 'hud-strip': {
      const tileCount = def.tiles?.length ?? 0;
      return { w: def.width ?? tileCount * 8, h: 8 };
    }
    case 'hud-vstrip':
      return { w: 8, h: (def.tiles?.length ?? 0) * 8 };
    case 'dialogue-glyph':
      return def.glyphRight === undefined ? { w: GLYPH_W, h: GLYPH_H } : undefined;
    default:
      return undefined;
  }
};

export { boxForExtract };
export type { SpriteBox };
