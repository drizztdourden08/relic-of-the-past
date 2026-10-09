/* @layer bridge-wasm @kind types */
import type { FloodFillOptions } from '../pathfinding/flood-fill/flood-options';
import type { SimLocation } from '../simulation';
import type { GridPos } from '@rotp/game-core';
import type { TileReq } from '@rotp/game-data';

interface FloodRequest {
  location: SimLocation;
  items: TileReq[];
  startPos?: GridPos;
  atPlayer?: boolean;
  entrances?: FloodFillOptions['entrances'];
  extraSeeds?: GridPos[];
  quadrantBounds?: FloodFillOptions['quadrantBounds'];
}

export type { FloodRequest };
