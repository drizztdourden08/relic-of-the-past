/* @layer shared-game @kind types */
import type { ConnectionKind, ConnectionSide, ScreenId } from '../data';
import type { GameScreenId } from '../logic/queries/game-id';
import type { GridPos } from './types';

type CrossingClass = 'entrance' | 'edge';

type CrossingOrigin =
  | 'ow-border' | 'ow-entrance' | 'room-border' | 'room-door'
  | 'room-doorway' | 'room-stair' | 'exit-table' | 'fall-hole' | 'warp-slot' | 'respawn';

interface CrossingTarget {
  screenId: ScreenId | null;
  native: GameScreenId | null;
}

interface CrossingSpan {
  from: number;
  to: number;
  freeTiles: number;
  itemTiles: number;
}

interface ScreenCrossing {
  id: string;
  class: CrossingClass;
  kind: ConnectionKind;
  origin: CrossingOrigin;
  tile: GridPos;
  placed: boolean;
  side?: ConnectionSide;
  layer?: 0 | 1;
  span?: CrossingSpan;
  layerToggle?: boolean;
  target: CrossingTarget;
  label: string;
  available: boolean;
  requirements: readonly string[];
  steps?: number;
  arrival?: string;
  isIntraRoom?: boolean;
}

interface ScreenCrossings {
  screenId: ScreenId | null;
  screenIndex: number;
  entrances: readonly ScreenCrossing[];
  edges: readonly ScreenCrossing[];
}

export type { CrossingClass, CrossingOrigin, CrossingSpan, CrossingTarget, ScreenCrossing, ScreenCrossings };
