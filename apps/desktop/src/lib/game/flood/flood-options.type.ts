/* @layer bridge-wasm @kind types */
import type { FloodFillOptions } from '@shared/game/navigation/flood-fill/flood-options';
import type { SimLocation } from '@shared/game/simulation';
import type { GridPos } from '@shared/game/navigation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';

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
