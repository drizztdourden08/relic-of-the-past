/* @layer shared-game @kind barrel */
export { classifyTile } from './classify-tile';
export { classifyTileAttr } from './classify-collision';
export { resolveInteractable } from './resolve-interactable';
export { resolveRoomContext } from './resolve-room-context';
export { roomTypeLabel } from './room-type-label';
export type {
  ClassifyTileParams, ResolveInteractableParams, RoomContext, TileClassification, TileInteractable,
} from './tile-classification.type';
