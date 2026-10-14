/* @layer renderer-components @kind constants */
import type { AnnotationKind } from '@rotp/navigation';
import type { AnnotationStyle } from './annotation-style.type';

const LOCK_COLOR = '#e8a33d';
const PICKUP_COLOR = '#7fb861';
const TRIGGER_COLOR = '#c9663f';
const INFO_COLOR = '#a89e8d';

const ANNOTATION_STYLES: Record<AnnotationKind, AnnotationStyle> = {
  chest: { glyph: '▣', color: PICKUP_COLOR, tone: 'checks', legend: 'Chest' },
  'big-chest': { glyph: '▧', color: PICKUP_COLOR, tone: 'checks', legend: 'Big chest (needs the big key)' },
  'npc-check': { glyph: '☻',color: PICKUP_COLOR, tone: 'checks', legend: 'NPC check' },
  'standing-item': { glyph: '◈', color: PICKUP_COLOR, tone: 'checks', legend: 'Standing item' },

  'key-door': { glyph: '⚿', color: LOCK_COLOR, tone: 'locks', legend: 'Small-key door' },
  'big-key-door': { glyph: '⚿', color: LOCK_COLOR, tone: 'locks', legend: 'Big-key door' },
  'cell-lock': { glyph: '⚿',color: LOCK_COLOR, tone: 'locks', legend: 'Cell lock (big key)' },
  shutter: { glyph: '▤', color: LOCK_COLOR, tone: 'locks', legend: 'Shutter door' },
  bombable: { glyph: '✸', color: LOCK_COLOR, tone: 'locks', legend: 'Bombable wall' },
  'follower-gate': { glyph: '◫', color: LOCK_COLOR, tone: 'locks', legend: 'Gate (needs the follower)' },

  'pull-switch': { glyph: '⇵', color: TRIGGER_COLOR, tone: 'triggers', legend: 'Pull switch' },
  'kill-trigger': { glyph: '✦', color: TRIGGER_COLOR, tone: 'triggers', legend: 'Clear room to open doors', panelOnly: true },
  'key-carrier': { glyph: '⚔', color: TRIGGER_COLOR, tone: 'triggers', legend: 'Enemy drops a small key' },
  'big-key-carrier': { glyph: '⚔',color: TRIGGER_COLOR, tone: 'triggers', legend: 'Enemy drops the big key' },

  unknown: { glyph: '?', color: INFO_COLOR, tone: 'other', legend: 'Unmapped (the sim found something new)' },
};

const DRAWN_KINDS = (Object.keys(ANNOTATION_STYLES) as AnnotationKind[])
  .filter((k) => !ANNOTATION_STYLES[k].panelOnly);

export { LOCK_COLOR, PICKUP_COLOR, TRIGGER_COLOR, INFO_COLOR, ANNOTATION_STYLES, DRAWN_KINDS };
