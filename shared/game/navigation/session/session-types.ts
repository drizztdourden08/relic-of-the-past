/* @layer shared-game @kind types */
import type { TileAttrContext } from '@shared/game/navigation/tile-attrs';
import type { FloodFillOptions, QuadrantBounds } from '@shared/game/navigation';
import type { OverworldEntrance } from '@shared/game/navigation';

interface FloodFillSession {
  screenIndex: number;
  isIndoors: boolean;
  tileContext: TileAttrContext;
  rawAttrGrid: number[][] | undefined;
  startPos: { row: number; col: number } | undefined;
  options: Omit<FloodFillOptions, 'tileContext' | 'startPos'>;
  allEntrances: OverworldEntrance[];
  groupScreens: number[];
  intraEdges: Array<{ edge: string; screens: [number, number] }>;
  quadrantBounds: QuadrantBounds | undefined;
  dualLayerGrids: { layer0: number[][]; layer1: number[][]; stairTiles: Array<{ row: number; col: number }> } | undefined;
  linkLayer: 0 | 1 | undefined;
  blockerWorldPoints: Array<{ x: number; y: number }>;
  items: string[];
}

interface SessionBuilderInput {
  isIndoors: boolean;
  primaryScreenIndex: number;
  linkX: number;
  linkY: number;
  items: string[];
  /** WASM data access functions */
  wasm: {
    getViewportInfo: () => { linkX: number; linkY: number; locationType: number } | null;
    getIndoorDualLayerGrids: () => { layer0: number[][]; layer1: number[][]; stairTiles: Array<{ row: number; col: number }> } | null;
    getIndoorLayer0Grid: () => Uint8Array | null;
    getLinkLayer: () => number | null;
    getStaircaseType: () => number | null;
    getOverworldVariant: (screenIndex: number) => { progressIndicator: number; eventOverlayActive: boolean; screenEventFlags: number } | null;
    buildOverworldAttrGrid: (screenIndex: number) => Uint8Array | null;
    getExitScreenMap: () => Map<number, number>;
    getRoomLayoutInfo: () => { shape: string; quadrantX: number; quadrantY: number; intraEdges: Array<{ edge: string; screens: [number, number] }> } | null;
    getRoomStairInfo: () => Array<{ row: number; col: number; destRoom: number }>;
    getRoomWalkBoundaries: () => Array<{ row: number; col: number; destRoom: number }>;
    getAreaHeads: () => number[] | null;
    getLiveSprites: () => Array<{ type: number; e: number; x: number; y: number }>;
    getOverworldGuardSpawns: () => Array<{ x: number; y: number }>;
    getIndoorUncleBlockers: () => Array<{ x: number; y: number }>;
    getFallHoles: () => Array<{ area: number; pos: number; entranceId: number }>;
    getOverworldEntrances: () => Array<{ area: number; pos: number; id: number }>;
    getEntranceRooms: () => number[] | null;
    getEntranceSpawns: () => Array<{ x: number; y: number; startingLayer: number }> | null;
    getRoomExitDoors: () => Array<{ row: number; col: number; direction: string }>;
  };
  /** Check if a tracker check is completed */
  isCheckCompleted: (checkName: string) => boolean;
}

export type { FloodFillSession, SessionBuilderInput };
