/* @layer shared-game @kind logic */
import type { SpriteDefinition } from '../manifest';
import type { ExtractShape, SpriteBox } from './sprite-box.type';
import { GLYPH_H, GLYPH_W, TILE_PX } from './sprite-box.constants';

const tileCountOf = (def: ExtractShape): number => def.tiles?.length ?? 0;

const boxForExtract = (extract: SpriteDefinition['extract']): SpriteBox | undefined => {
  const def = extract as ExtractShape;
  switch (def.method) {
    case 'hud-single':
      return { w: TILE_PX, h: TILE_PX };
    case 'hud-strip':
      return { w: def.width ?? tileCountOf(def) * TILE_PX, h: TILE_PX };
    case 'hud-vstrip':
      return { w: TILE_PX, h: tileCountOf(def) * TILE_PX };
    case 'dialogue-glyph':
      return def.glyphRight === undefined ? { w: GLYPH_W, h: GLYPH_H } : undefined;
    case undefined:
      return undefined;
  }
};

export { boxForExtract };
