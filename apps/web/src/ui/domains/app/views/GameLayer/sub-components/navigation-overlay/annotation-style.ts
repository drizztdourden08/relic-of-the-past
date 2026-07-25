/* @layer renderer-components @kind constants */
/**
 * One row per AnnotationKind: the glyph, colour and legend text. Exhaustive by
 * type (`Record<AnnotationKind, …>`), so adding a kind without a visual is a
 * compile error rather than something that silently never draws.
 *
 * Colours are semantic, not decorative: amber = a lock or gate, green = a pickup
 * or check, cyan = a way off the screen, red-clay = a trigger that needs an
 * action, grey = informational.
 */
import type { AnnotationKind } from '@shared/game/simulation';

interface AnnotationStyle {
  /** Single glyph drawn in the marker. */
  glyph: string;
  color: string;
  /** Legend wording — what the player/reader is actually looking at. */
  legend: string;
  /** Screen-wide facts (room tags) have no meaningful tile; drawn in the panel. */
  panelOnly?: boolean;
}

const LOCK = '#e8a33d';
const PICKUP = '#7fb861';
const WAY_OUT = '#5fb3c4';
const TRIGGER = '#c9663f';
const INFO = '#a89e8d';

const ANNOTATION_STYLES: Record<AnnotationKind, AnnotationStyle> = {
  chest: { glyph: '▣', color: PICKUP, legend: 'Chest' },
  'big-chest': { glyph: '▧', color: PICKUP, legend: 'Big chest (needs the big key)' },
  'npc-check': { glyph: '☻', color: PICKUP, legend: 'NPC check' },
  'standing-item': { glyph: '◈', color: PICKUP, legend: 'Standing item' },

  'key-door': { glyph: '⚿', color: LOCK, legend: 'Small-key door' },
  'big-key-door': { glyph: '⚿', color: LOCK, legend: 'Big-key door' },
  'cell-lock': { glyph: '⚿', color: LOCK, legend: 'Cell lock (big key)' },
  shutter: { glyph: '▤', color: LOCK, legend: 'Shutter door' },
  bombable: { glyph: '✸', color: LOCK, legend: 'Bombable wall' },
  'follower-gate': { glyph: '◫', color: LOCK, legend: 'Gate — needs the follower' },

  'pull-switch': { glyph: '⇵', color: TRIGGER, legend: 'Pull switch' },
  'kill-trigger': { glyph: '✦', color: TRIGGER, legend: 'Clear room to open doors', panelOnly: true },
  'key-carrier': { glyph: '⚔', color: TRIGGER, legend: 'Enemy drops a small key' },
  'big-key-carrier': { glyph: '⚔', color: TRIGGER, legend: 'Enemy drops the big key' },

  'warp-door': { glyph: '➘', color: WAY_OUT, legend: 'Warp door' },
  'exit-door': { glyph: '⤴', color: WAY_OUT, legend: 'Exit to overworld' },
  stair: { glyph: '⌁', color: WAY_OUT, legend: 'Stair' },
  'walk-boundary': { glyph: '⇢', color: WAY_OUT, legend: 'Walk-through boundary' },
  'fall-hole': { glyph: '◌', color: WAY_OUT, legend: 'Fall hole' },
  entrance: { glyph: '⌂', color: WAY_OUT, legend: 'Entrance' },
  exit: { glyph: '→', color: WAY_OUT, legend: 'Traversable exit' },

  unknown: { glyph: '?', color: INFO, legend: 'Unmapped — the sim found something new' },
};

/** Kinds that draw on the canvas (everything except screen-wide facts). */
const DRAWN_KINDS = (Object.keys(ANNOTATION_STYLES) as AnnotationKind[])
  .filter((k) => !ANNOTATION_STYLES[k].panelOnly);

export { ANNOTATION_STYLES, DRAWN_KINDS };
export type { AnnotationStyle };
