/* @layer shared-game @kind logic */
/**
 * The one shape every event record takes: kind 'event', no item, a section, and a
 * numbered id from the events' own range (check-300 upward, after the item checks).
 */
import type { CheckGameId, CheckId, CheckRecord, DungeonId, EventGroup, PresenceCondition, Requirement } from '@shared/game/data/types';
import { EVENT_SCREENS } from './event-screens.data';

const EVENT_ID_BASE = 300;

interface EventSpec {
  n: number;
  name: string;
  /** The reference randomizer's own name for this event, where it has one; the display name stays ours. */
  apName?: string;
  group: EventGroup;
  gameId?: CheckGameId;
  dungeonId?: DungeonId;
  derived?: Requirement;
  fallback?: Requirement;
  now?: PresenceCondition;
  derivedDungeon?: CheckRecord['derivedDungeon'];
  statusOnly?: true;
  /** What the event asks for beyond reaching its screen, in items and earlier checks (the tracker's logic). */
  requirements?: Requirement;
}

const eventId = (n: number): CheckId => `check-${String(EVENT_ID_BASE + n).padStart(3, '0')}` as CheckId;

const eventRecord = (spec: EventSpec): CheckRecord => {
  const { n, name, apName, group, gameId = {}, dungeonId, derived, fallback, now, derivedDungeon, statusOnly, requirements } = spec;
  return {
    id: eventId(n),
    gameId,
    kind: 'event',
    randomizerName: apName ?? name,
    ...(apName !== undefined ? { vanillaName: name } : {}),
    vanillaItemIds: [],
    eventGroup: group,
    // An event lists under the screen it happens on, like any item check (event-screens.data.ts).
    ...(EVENT_SCREENS[n] !== undefined ? { screenId: EVENT_SCREENS[n] } : {}),
    ...(dungeonId !== undefined ? { dungeonId } : {}),
    ...(derived !== undefined ? { derived } : {}),
    ...(fallback !== undefined ? { fallback } : {}),
    ...(now !== undefined ? { now } : {}),
    ...(derivedDungeon !== undefined ? { derivedDungeon } : {}),
    ...(statusOnly ? { statusOnly } : {}),
    ...(requirements !== undefined ? { requirements } : {}),
  };
};

export { EVENT_ID_BASE, eventId, eventRecord };
export type { EventSpec };
