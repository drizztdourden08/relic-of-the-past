/* @layer shared-game @kind types */
import type { TileBehavior, TileVisual } from '../../data/types';
import type { SimDoor } from '../../simulation';
import type { TilePassability } from '../types';

interface RoomContext {
  indoors: boolean;
  palaceIndex: number | null;
}

interface TileInteractable {
  family: 'door' | 'manipulable' | 'chest';
  source: 'door-table' | 'replacement-tile-state' | 'chest-locations';
  slot: number;
  kind: string;
  state: 'open' | 'shut' | 'unknown';
}

interface TileClassification {
  attr: number;
  layer: 0 | 1;
  behavior: TileBehavior;
  visual: TileVisual;
  room: RoomContext;
  collision: TilePassability;
  interactable?: TileInteractable;
}

interface ClassifyTileParams {
  attr: number;
  layer: 0 | 1;
  indoors: boolean;
  palaceIndex: number | null;
  replacementTileState: readonly number[];
  chestLocations: readonly number[];
  doors: readonly SimDoor[];
}

interface ResolveInteractableParams {
  attr: number;
  behavior: TileBehavior;
  replacementTileState: readonly number[];
  chestLocations: readonly number[];
  doors: readonly SimDoor[];
}

export type { ClassifyTileParams, ResolveInteractableParams, RoomContext, TileClassification, TileInteractable };
