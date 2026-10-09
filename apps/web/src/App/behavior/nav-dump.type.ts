/* @layer renderer-appshell @kind types */
import type { ScreenAnnotations } from '@shared/game/simulation';
import type { GridPos } from '@shared/game/navigation';
import type { ScreenMatchResult } from '@shared/game/logic/queries/detection';
import type {
  wasmGetProgressIndicator,
  wasmGetRoomDoorBoundaryTiles,
  wasmGetRoomLayoutInfo,
  wasmGetToggleFloorPositions,
  wasmGetViewportInfo,
} from '../../lib/game';
import type { FallHoleLanding, FloodFillDump, MatchingEntrance, StairInfo, TravelDest } from './dump-nav.type';

type DumpSlot = number | string;

interface NavLocation {
  roomIndex: number;
  palaceIndex: number;
  overworldScreenIndex: number;
  isIndoors: boolean;
  whichEntrance: number;
}

interface NavDumpParts {
  slot: DumpSlot;
  location: NavLocation;
  progressInfo: ReturnType<typeof wasmGetProgressIndicator>;
  viewport: ReturnType<typeof wasmGetViewportInfo>;
  detection: ScreenMatchResult | null;
  exitScreen: number | null;
  matchingEntrances: MatchingEntrance[];
  fallHoleLandings: FallHoleLanding[];
  stairInfo: StairInfo[];
  travelDests: TravelDest[] | null;
  doorBoundaryTiles: ReturnType<typeof wasmGetRoomDoorBoundaryTiles>;
  attrGrid: Uint8Array | null;
  roomLayout: ReturnType<typeof wasmGetRoomLayoutInfo> | null;
  playerLayer: 0 | 1 | null;
  startPos: GridPos | undefined;
  staircaseType: number | null;
  toggleFloorPositions: ReturnType<typeof wasmGetToggleFloorPositions>;
  floodFill: FloodFillDump | null;
  annotations: ScreenAnnotations | null;
}

export type { DumpSlot, NavDumpParts, NavLocation };
