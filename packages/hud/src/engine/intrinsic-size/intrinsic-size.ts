/* @layer shared-hud @kind logic */
import { MAGIC_SIZE } from '../../layouts/element-sizes';
import { resolveTextContent, textIntrinsicSize } from '../resolve-text';
import { SPRITE_BOX_BY_FILE } from '@rotp/game-data';
import { FIXED_SIZES, HEART_SHAPE_SIZE, TILE_SIZE } from './intrinsic-size.constants';
import type { HudElementSpec } from '../../types/hud-node';
import type { MeasureContext } from '../engine.type';
import type { Size } from '../../layouts/geometry.type';

const spriteSize = (spec: Extract<HudElementSpec, { type: 'sprite' }>): Size => {
  const box = spec.box ?? SPRITE_BOX_BY_FILE[spec.file];
  return box ? { ...box } : { ...TILE_SIZE };
};

const intrinsicSize = (spec: HudElementSpec, ctx: MeasureContext = {}): Size => {
  if (spec.type === 'shape') return spec.shape === 'heart' ? { ...HEART_SHAPE_SIZE } : { ...MAGIC_SIZE };
  if (spec.type === 'sprite') return spriteSize(spec);
  if (spec.type === 'text') return textIntrinsicSize(resolveTextContent(spec, ctx.scope ?? {}), spec.face);
  return { ...FIXED_SIZES[spec.type] };
};

export { intrinsicSize };
