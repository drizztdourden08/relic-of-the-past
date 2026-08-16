/* @layer shared-game @kind types */
/**
 * ScreenAnnotations — the one description of "what is on this screen and what
 * state is it in", derived from the simulator's own discovery so the overlay, the
 * minimaps and the widget panel cannot disagree with the run.
 *
 * Deliberately a GENERATOR, not a checklist: annotations come from the same
 * interactable reads the engine gates targets on, so a mechanic the simulator
 * learns to find shows up here automatically. A kind with no renderer is a test
 * failure (see the renderer registry), and an unmapped kind still draws as a
 * neutral marker — a new mechanic can never ship invisible.
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
   * Wall the door record sits in, for door-table kinds only. A door's real
   * footprint is wide along the wall and shallow through it — 'n'/'s' doors are
   * wide in columns, 'e'/'w' doors are wide in rows — so a marker sized/nudged
   * the same way regardless of direction ends up centered for one orientation
   * and pushed to one side of the opening for the other.
   */
  direction?: 'n' | 's' | 'e' | 'w';
  /** Short human label, resolved for display only — never an identity. */
  label: string;
  /**
   * The check this thing IS, when it is one. Without it a standing item has no
   * check identity, so `state` can only ever say "available" — it cannot know
   * whether the run already collected it. Identity is the id; `label` is the
   * rendering of it.
   */
  checkId?: CheckId;
  state?: AnnotationState;
  /** Secondary line: item name, destination screen, walk distance. */
  detail?: string;
  /** Traversal tokens this thing demands ('smallkey:*', 'bigkey:*', 'sword'…). */
  requires?: string[];
}

/** One room-header TAG byte, decoded. Screen-wide, so it has no tile. */
interface ScreenTag {
  value: number;
  name: string;
}

interface ScreenAnnotations {
  screenId: string;
  /** Room id indoors, overworld screen index outdoors — for world placement. */
  screenIndex: number;
  items: ScreenAnnotation[];
  /** Check progress for this screen, for the minimap badge. */
  checks: { done: number; available: number; blocked: number };
  /** Decoded room tags — what mechanic the room header arms. Indoors only. */
  tags?: readonly ScreenTag[];
}

export type { AnnotationKind, AnnotationState, ScreenAnnotation, ScreenAnnotations, ScreenTag };
