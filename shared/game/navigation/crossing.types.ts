/* @layer shared-game @kind data */
import type { ConnectionKind, ConnectionSide, ScreenId } from '../data';
import type { GameScreenId } from '../logic/queries/game-id';
import type { GridPos } from './types';

/** `entrance` is every crossing that is NOT a screen-boundary scroll: doors,
 *  thresholds, stairs, holes, drops, warps, respawn points. `edge` is a scroll. */
type CrossingClass = 'entrance' | 'edge';

/**
 * Which detector produced the crossing — the provenance the annotation kinds
 * carried and the entrance/edge models lack.
 *
 * `room-border` covers both a room's walk-through boundary row and a flood
 * border scroll between rooms; `class` tells those two apart.
 */
type CrossingOrigin =
  | 'ow-border' | 'ow-entrance' | 'room-border' | 'room-door'
  | 'room-doorway' | 'room-stair' | 'exit-table' | 'fall-hole' | 'warp-slot' | 'respawn';

/** Where a crossing leads, in both vocabularies. `native` uses the game's own
 *  unified 0x00-0x7F overworld numbering, whose bit 0x40 IS the dark world. */
interface CrossingTarget {
  screenId: ScreenId | null;
  native: GameScreenId | null;
}

/**
 * The run of tiles a boundary scroll occupies, plus how many of them are plain
 * floor and how many ask for an item. `from` and `to` are columns for a north
 * or south scroll and rows for an east or west one, matching `side`.
 */
interface CrossingSpan {
  from: number;
  to: number;
  freeTiles: number;
  itemTiles: number;
}

interface ScreenCrossing {
  /** Stable within a screen: 'ent:5', 'stair:1001', 'edge:north:31-32', 'warp:3'. */
  id: string;
  class: CrossingClass;
  /** The dataset's own vocabulary, so a proposal needs no translation. */
  kind: ConnectionKind;
  origin: CrossingOrigin;
  /** The walkable tile the player occupies, offset already applied. */
  tile: GridPos;
  /**
   * Whether `tile` is a real position on the screen. A crossing the game names
   * without saying where it is — the exit table's way back outside — describes
   * the whole screen instead, so it belongs in a list but on no map.
   */
  placed: boolean;
  side?: ConnectionSide;
  /** The floor the crossing sits on: 0 upper, 1 lower. */
  layer?: 0 | 1;
  /** Edge only: the tiles the scroll runs across and what they ask for. */
  span?: CrossingSpan;
  /** Edge only: crossing this boundary flips the floor the player is on. */
  layerToggle?: boolean;
  /** Resolved once here, never recomputed per render. */
  target: CrossingTarget;
  label: string;
  /**
   * Whether the player can take this crossing right now: within reach of the
   * flood AND holding every requirement. An unavailable crossing is KEPT and
   * marked, never dropped.
   */
  available: boolean;
  requirements: readonly string[];
  /** Walk-steps from the flood's start tile, when the distance is real. */
  steps?: number;
  /** How the crossing is taken, in words ("via north edge, tiles 31-32"). */
  arrival?: string;
  /** A scroll between quadrants of one room, which leaves no screen. */
  isIntraRoom?: boolean;
}

interface ScreenCrossings {
  screenId: ScreenId | null;
  /** Room index indoors, overworld screen index outdoors. */
  screenIndex: number;
  entrances: readonly ScreenCrossing[];
  edges: readonly ScreenCrossing[];
}

export type { CrossingClass, CrossingOrigin, CrossingSpan, CrossingTarget, ScreenCrossing, ScreenCrossings };
