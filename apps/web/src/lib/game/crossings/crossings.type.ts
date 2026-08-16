/* @layer bridge-wasm @kind data */
import type { ConnectionInfo, FloodFillResult, GridPos } from '@shared/game/navigation';
import type { ReachState } from '@shared/game/navigation/types';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import type { ConnectionKind, ConnectionSide } from '@shared/game/data';
import type { CrossingClass, CrossingOrigin, CrossingSpan } from '@shared/game/navigation';
import type { ResolvedTarget } from './resolve-target';

/** The screen a caller wants the crossings of. */
interface CrossingScope {
  isIndoors: boolean;
  /** Room index when indoors. */
  roomIndex: number;
  /** Overworld screen index when outdoors, in the unified 0x00-0x7F numbering. */
  owScreenIndex: number;
  flood?: FloodFillResult;
  /** Border connections of `flood`; derived from it when omitted. */
  connections?: readonly ConnectionInfo[];
  /** Traversal tokens the player holds; taken from the flood when omitted. */
  items?: readonly TileReq[];
}

/** The scope plus everything derived from the flood once per pass. */
interface CrossingPass {
  scope: CrossingScope;
  items: readonly TileReq[];
  reachable?: readonly ReachState[][];
  /** Walk-steps per tile from the flood's start, as the simulator orders exits. */
  dist?: Uint16Array;
}

/** Everything a detector knows about a crossing before the pass fills the rest. */
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
  /** The simulator's own signature for this crossing, which names the arrival. */
  edgeSig?: string;
  requirements?: readonly string[];
  isIntraRoom?: boolean;
  /**
   * The crossing describes the whole screen rather than a spot on it, so its
   * tile is a placeholder and reachability says nothing about it.
   */
  screenWide?: boolean;
}

export type { CrossingScope, CrossingPass, CrossingParts };
