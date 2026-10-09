/* @layer bridge-wasm @kind types */
import type { ConnectionInfo, FloodFillResult, GridPos } from '@shared/game/navigation';
import type { ReachState } from '@shared/game/navigation/types';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import type { ConnectionKind, ConnectionSide } from '@rotp/game-data';
import type { CrossingClass, CrossingOrigin, CrossingSpan } from '@shared/game/navigation';
import type { ResolvedTarget } from './resolve-target';

interface CrossingScope {
  isIndoors: boolean;
  roomIndex: number;
  owScreenIndex: number;
  flood?: FloodFillResult;
  connections?: readonly ConnectionInfo[];
  items?: readonly TileReq[];
}

interface CrossingPass {
  scope: CrossingScope;
  items: readonly TileReq[];
  reachable?: readonly ReachState[][];
  dist?: Uint16Array;
}

interface CrossingParts {
  id: string;
  class: CrossingClass;
  kind: ConnectionKind;
  origin: CrossingOrigin;
  tile: GridPos;
  target: ResolvedTarget;
  side?: ConnectionSide;
  layer?: 0 | 1;
  span?: CrossingSpan;
  layerToggle?: boolean;
  edgeSig?: string;
  requirements?: readonly string[];
  isIntraRoom?: boolean;
  screenWide?: boolean;
}

export type { CrossingScope, CrossingPass, CrossingParts };
