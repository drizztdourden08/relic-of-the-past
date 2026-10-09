/* @layer shared-game @kind barrel */
export { OVERWORLD_TILE_ATTRS } from '../overworld-attrs';
export {
  CLIFF_FACE_TILES, CLIFF_TRIGGER_TILES, HOOKSHOT_TARGET_TILES, PIT_TILES, TILE_ATTRS, WATER_TILES,
} from './tile-attrs.constants';
export { tileAttrsFor } from './tile-attrs-for';
export { getAttrLabel } from './get-attr-label';
export { getAttrReq } from './get-attr-req';
export { isCategory } from './is-category';
export { isDoorPassageAttr } from './is-door-passage-attr';
export { isPassableAttr } from './is-passable-attr';
export { getHookshotTargetTiles } from './get-hookshot-target-tiles';
export type { TileReq, TileLabel, TilePass, TileCat, TileAttrDef } from '../../data/types/tile-attrs-types';
