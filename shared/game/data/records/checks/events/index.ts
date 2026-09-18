/* @layer shared-game @kind barrel */
import type { CheckRecord } from '@shared/game/data/types';
import { DUNGEON_EVENTS } from './dungeons';
import { STORY_EVENTS } from './story';
import { AREA_EVENTS, COMBINED_EVENTS, FAIRY_EVENTS, HELD_EVENTS } from './world';

// Events sort after the item checks and before nothing: the derived pass visits records in
// this order, and a combined event only names records that come before it.
const EVENT_CHECKS: CheckRecord[] = [
  ...STORY_EVENTS,
  ...DUNGEON_EVENTS,
  ...HELD_EVENTS,
  ...FAIRY_EVENTS,
  ...AREA_EVENTS,
  ...COMBINED_EVENTS,
];

export { EVENT_CHECKS };
