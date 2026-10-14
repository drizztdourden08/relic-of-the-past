/* @layer renderer-appshell @kind logic */
import {
  wasmGetRoomDoorBoundaryTiles,
  wasmGetRoomLayoutInfo,
  wasmGetLinkLayer,
  wasmGetStaircaseType,
  wasmBuildRoomAttrGrid,
  wasmGetToggleFloorPositions,
  wasmGetIndoorDualLayerGrids,
} from '@app/game';

const readIndoorData = (isIndoors: boolean, roomIndex: number) => ({
  doorBoundaryTiles: isIndoors ? wasmGetRoomDoorBoundaryTiles() : [],
  roomLayout: isIndoors ? wasmGetRoomLayoutInfo() : null,
  playerLayer: isIndoors ? wasmGetLinkLayer() : null,
  staircaseType: isIndoors ? wasmGetStaircaseType() : null,
  dualLayerGrids: isIndoors ? wasmGetIndoorDualLayerGrids() : null,
  attrGrid: isIndoors ? wasmBuildRoomAttrGrid(roomIndex) : null,
  toggleFloorPositions: isIndoors ? wasmGetToggleFloorPositions() : [],
});

export { readIndoorData };
