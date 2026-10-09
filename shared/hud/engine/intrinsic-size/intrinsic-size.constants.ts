/* @layer shared-hud @kind constants */
import { HEART_SIZE } from '../../layouts/element-sizes';
import type { Size } from '../../layouts/geometry.type';

const TILE = 16;
const TILE_SIZE: Size = { w: TILE, h: TILE };

const HEART_SHAPE_SIZE: Size = { w: HEART_SIZE, h: HEART_SIZE };

const EMPTY_SIZE: Size = { w: 0, h: 0 };

export { EMPTY_SIZE, HEART_SHAPE_SIZE, TILE, TILE_SIZE };
