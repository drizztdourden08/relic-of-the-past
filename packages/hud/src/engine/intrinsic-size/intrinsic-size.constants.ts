/* @layer shared-hud @kind constants */
import { COUNTDOWN_SIZE, HEART_SIZE } from '../../layouts/element-sizes';
import type { Size } from '../../layouts/geometry.type';
import type { FixedSizeType } from './intrinsic-size.type';

const TILE = 16;
const TILE_SIZE: Size = { w: TILE, h: TILE };

const HEART_SHAPE_SIZE: Size = { w: HEART_SIZE, h: HEART_SIZE };

const EMPTY_SIZE: Size = { w: 0, h: 0 };

const FIXED_SIZES: Readonly<Record<FixedSizeType, Size>> = {
  glyph: TILE_SIZE,
  slot: TILE_SIZE,
  button: TILE_SIZE,
  spacer: EMPTY_SIZE,
  countdown: COUNTDOWN_SIZE,
  repeat: EMPTY_SIZE,
  switch: EMPTY_SIZE,
};

export { EMPTY_SIZE, FIXED_SIZES, HEART_SHAPE_SIZE, TILE, TILE_SIZE };
