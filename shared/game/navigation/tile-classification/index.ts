/* @layer shared-game @kind barrel */
export { classifyTile } from './classify-tile';
export { classifyTileAttr } from './classify-collision';
export { resolveInteractable } from './resolve-interactable';
export type { ResolveInteractableParams } from './resolve-interactable';
export { resolveRoomContext, roomTypeLabel } from './resolve-room-context';
export type { RoomContext, TileInteractable, TileClassification, ClassifyTileParams } from './types';
