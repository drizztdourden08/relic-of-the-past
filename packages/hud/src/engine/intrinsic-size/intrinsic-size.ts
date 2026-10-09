/* @layer shared-hud @kind logic */
import { COUNTDOWN_SIZE, MAGIC_SIZE } from '../../layouts/element-sizes';
import { resolveTextContent, textIntrinsicSize } from '../resolve-text';
import { SPRITE_BOX_BY_FILE } from '@rotp/game-data';
import { EMPTY_SIZE, HEART_SHAPE_SIZE, TILE_SIZE } from './intrinsic-size.constants';
import type { HudElementSpec } from '../../types/hud-node';
import type { MeasureContext } from '../engine.type';
import type { Size } from '../../layouts/geometry.type';

const intrinsicSize = (spec: HudElementSpec, ctx: MeasureContext = {}): Size => {
  switch (spec.type) {
    case 'shape': return spec.shape === 'heart' ? { ...HEART_SHAPE_SIZE } : { ...MAGIC_SIZE };
    case 'sprite': {
      const box = spec.box ?? SPRITE_BOX_BY_FILE[spec.file];
      return box ? { ...box } : { ...TILE_SIZE };
    }
    case 'glyph':
    case 'slot':
    case 'button': return { ...TILE_SIZE };
    case 'spacer': return { ...EMPTY_SIZE };
    case 'countdown': return { ...COUNTDOWN_SIZE };
    case 'text': return textIntrinsicSize(resolveTextContent(spec, ctx.scope ?? {}), spec.face);
    case 'repeat':
    case 'switch': return { ...EMPTY_SIZE };
  }
};

export { intrinsicSize };
