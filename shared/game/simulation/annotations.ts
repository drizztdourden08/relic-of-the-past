/* @layer shared-game @kind types */
/**
 * "What is on this screen and what state is it in", derived from the
 * simulator's own discovery so the overlay, the minimaps and the widget panel
 * cannot disagree with the run. A kind with no renderer is a test failure (see
 * the renderer registry); an unmapped kind still draws as a neutral marker.
 */
import type { GridPos } from '../navigation/types';
import type { CheckId } from '../data';

type AnnotationKind =
  // Pickups & checks
  | 'chest' | 'big-chest' | 'npc-check' | 'standing-item'
  // Locks & barriers
  | 'key-door' | 'big-key-door' | 'cell-lock' | 'shutter' | 'bombable' | 'follower-gate'
  // Triggers
  | 'pull-switch' | 'kill-trigger' | 'key-carrier' | 'big-key-carrier'
  // Ways off the screen. Real entrances, stairs and walk-through boundaries are
  // NOT here: they come from the room-entrances/OverworldEntrance pipeline
  // (apps/web/src/lib/game/flood/room-entrances.ts) and draw through their own renderer.
  | 'warp-door' | 'exit-door' | 'exit'
  // Anything the simulator reports that has no mapping yet.
  | 'unknown';

/** Display state. `shut`/`open` are physical; the rest are check progress. */
type AnnotationState = 'open' | 'shut' | 'done' | 'available' | 'blocked';

interface ScreenAnnotation {
  kind: AnnotationKind;
  tile: GridPos;
  /** BG layer the thing sits on, when it is layer-specific. */
  layer?: 0 | 1;
  /**
   * Wall the door record sits in, for door-table kinds only. A door's footprint
   * is wide along the wall and shallow through it ('n'/'s' wide in columns,
   * 'e'/'w' wide in rows), so a marker must be sized per direction.
   */
  direction?: 'n' | 's' | 'e' | 'w';
  /** Short human label, resolved for display only. Never an identity. */
  label: string;
  /** The check this thing IS, when it is one. Without it `state` can only say
   *  "available", since nothing knows whether the run already collected it. */
  checkId?: CheckId;
  state?: AnnotationState;
  /** Secondary line: item name, destination screen, walk distance. */
  detail?: string;
  /** Traversal tokens this thing demands ('smallkey:*', 'bigkey:*', 'sword', ...). */
  requires?: string[];
  /** For a way off the screen: the screen id it leads to. */
  target?: string;
}

/** One room-header TAG byte, decoded. Screen-wide, so it has no tile. */
interface ScreenTag {
  value: number;
  name: string;
}

interface ScreenAnnotations {
  screenId: string;
  /** Room id indoors, overworld screen index outdoors. Used for world placement. */
  screenIndex: number;
  items: ScreenAnnotation[];
  /** Check progress for this screen, for the minimap badge. */
  checks: { done: number; available: number; blocked: number };
  /** Decoded room tags saying what mechanic the room header arms. Indoors only. */
  tags?: readonly ScreenTag[];
}

export type { AnnotationKind, AnnotationState, ScreenAnnotation, ScreenAnnotations, ScreenTag };
