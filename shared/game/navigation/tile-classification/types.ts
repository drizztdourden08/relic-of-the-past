/* @layer shared-game @kind data */
import type { TileBehavior, TileVisual } from '../../data/types';
import type { SimDoor } from '../../simulation';
import type { TilePassability } from '../types';

/**
 * `indoors` is the ONLY field any tile lookup keys on — the engine's whole
 * tile-dispatch context (core/zelda3/src/tile_detect.c:256 takes one bool).
 * Everything else is descriptive and read only by the tooltip.
 */
interface RoomContext {
  indoors: boolean;
  /** cur_palace_index_x2 >> 1, or null when the game reports 0xff. */
  palaceIndex: number | null;
}

/**
 * Resolved from a live side-table slot — NEVER inferred from the attribute
 * byte. `source` records which table answered, so an unresolvable tile stays
 * honestly unresolved instead of being guessed.
 */
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
  /** Absent when no side-table resolved this tile. Absence is a real answer. */
  interactable?: TileInteractable;
}

/**
 * Everything classifyTile needs, all passed as plain values — `shared/game/**`
 * never touches WASM/React/DOM/Node, so live state (side-tables, room context)
 * always arrives as parameters from the caller.
 */
interface ClassifyTileParams {
  attr: number;
  layer: 0 | 1;
  indoors: boolean;
  /** cur_palace_index_x2 >> 1, or null when the game reports 0xff. */
  palaceIndex: number | null;
  replacementTileState: readonly number[];
  chestLocations: readonly number[];
  doors: readonly SimDoor[];
}

export type { RoomContext, TileInteractable, TileClassification, ClassifyTileParams };
