/* @layer renderer-components @kind constants */
/**
 * One row per AnnotationKind: the glyph, colour and legend text. Exhaustive by
 * type (`Record<AnnotationKind, …>`), so adding a kind without a visual is a
 * compile error rather than something that silently never draws.
 *
 * Colours are semantic, not decorative: amber = a lock or gate, green = a pickup
 * or check, red-clay = a trigger that needs an action, grey = informational.
 * The three ways off the screen this file draws (warp-door, exit-door, exit)
 * each get their own shade of cyan/purple rather than one shared colour — they
 * used to be visually identical, distinguishable only by a tiny glyph. Real
 * entrance/stair/walk-boundary icons are a SEPARATE renderer (draw-entrances.ts,
 * amber/purple) and never come through this table at all.
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
const EXIT = '#5fb3c4';
const EXIT_DOOR = '#3d8fa3';
const WARP = '#9b6fd6';
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

  'warp-door': { glyph: '➘', color: WARP, legend: 'Warp door' },
  'exit-door': { glyph: '⤴', color: EXIT_DOOR, legend: 'Exit to overworld' },
  exit: { glyph: '→', color: EXIT, legend: 'Traversable exit' },

  unknown: { glyph: '?', color: INFO, legend: 'Unmapped — the sim found something new' },
};

/** Kinds that draw on the canvas (everything except screen-wide facts). */
const DRAWN_KINDS = (Object.keys(ANNOTATION_STYLES) as AnnotationKind[])
  .filter((k) => !ANNOTATION_STYLES[k].panelOnly);

export { ANNOTATION_STYLES, DRAWN_KINDS };
export type { AnnotationStyle };
