/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { AnnotationKind } from '@rotp/navigation';
import type { AnnotationStyle } from './annotation-style.type';

const LOCK_COLOR = '#e8a33d';
const PICKUP_COLOR = '#7fb861';
const TRIGGER_COLOR = '#c9663f';
const INFO_COLOR = '#a89e8d';

const ANNOTATION_STYLES: Record<AnnotationKind, AnnotationStyle> = {
  chest: { glyph: '▣', color: PICKUP_COLOR, tone: 'checks', legend: msg('views-navigation:overlay.legend.chest') },
  'big-chest': { glyph: '▧', color: PICKUP_COLOR, tone: 'checks', legend: msg('views-navigation:overlay.legend.big-chest') },
  'npc-check': { glyph: '☻',color: PICKUP_COLOR, tone: 'checks', legend: msg('views-navigation:overlay.legend.npc-check') },
  'standing-item': { glyph: '◈', color: PICKUP_COLOR, tone: 'checks', legend: msg('views-navigation:overlay.legend.standing-item') },

  'key-door': { glyph: '⚿', color: LOCK_COLOR, tone: 'locks', legend: msg('views-navigation:overlay.legend.key-door') },
  'big-key-door': { glyph: '⚿', color: LOCK_COLOR, tone: 'locks', legend: msg('views-navigation:overlay.legend.big-key-door') },
  'cell-lock': { glyph: '⚿',color: LOCK_COLOR, tone: 'locks', legend: msg('views-navigation:overlay.legend.cell-lock') },
  shutter: { glyph: '▤', color: LOCK_COLOR, tone: 'locks', legend: msg('views-navigation:overlay.legend.shutter') },
  bombable: { glyph: '✸', color: LOCK_COLOR, tone: 'locks', legend: msg('views-navigation:overlay.legend.bombable') },
  'follower-gate': { glyph: '◫', color: LOCK_COLOR, tone: 'locks', legend: msg('views-navigation:overlay.legend.follower-gate') },

  'pull-switch': { glyph: '⇵', color: TRIGGER_COLOR, tone: 'triggers', legend: msg('views-navigation:overlay.legend.pull-switch') },
  'kill-trigger': { glyph: '✦', color: TRIGGER_COLOR, tone: 'triggers', legend: msg('views-navigation:overlay.legend.kill-trigger'), panelOnly: true },
  'key-carrier': { glyph: '⚔', color: TRIGGER_COLOR, tone: 'triggers', legend: msg('views-navigation:overlay.legend.key-carrier') },
  'big-key-carrier': { glyph: '⚔',color: TRIGGER_COLOR, tone: 'triggers', legend: msg('views-navigation:overlay.legend.big-key-carrier') },

  unknown: { glyph: '?', color: INFO_COLOR, tone: 'other', legend: msg('views-navigation:overlay.legend.unknown') },
};

export { ANNOTATION_STYLES };
