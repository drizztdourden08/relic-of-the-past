/* @layer shared-game @kind types */
import type { GridPos } from '@rotp/game-core';
import type { TraversalId } from '../traversal-id.type';

interface SimArea {
  key: string;
  label: string;
  size: number;
}

type SimExitOrigin = 'ow-border' | 'ow-entrance' | 'room-border' | 'room-stair' | 'room-door' | 'room-doorway' | 'room-warp' | 'exit-table';

interface SimExit {
  to: TraversalId;
  origin?: SimExitOrigin;
  edgeSig?: string;
  entryTile?: GridPos;
  twoWay?: boolean;
  fromTile?: GridPos;
  via?: TraversalId;
  steps?: number;
  score?: number;
  stepsNote?: 'other-screen' | 'via-hop';
  area?: SimArea;
}

export type { SimArea, SimExit };
