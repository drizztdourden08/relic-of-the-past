/* @layer shared-game @kind logic */
/**
 * The one shape every event record takes: kind 'event', no item, a section, and a
 * numbered id from the events' own range (check-300 upward, after the item checks).
 */
import type {
  ActorId, CheckGameId, CheckId, CheckRecord, DungeonId, EventGroup, PresenceCondition, Requirement, ScreenId,
} from '@shared/game/data/types';
import { EVENT_SCREENS } from './event-screens.data';
import { EVENT_REGIONS } from './event-regions.data';

const EVENT_ID_BASE = 300;

interface EventSpec {
  n: number;
  name: string;
  group: EventGroup;
  gameId?: CheckGameId;
  dungeonId?: DungeonId;
  /**
   * The prefix of the row's standard name, as on an item row. A story beat that happens inside
   * a dungeon passes '' so it files under that dungeon and keeps its own name alone.
   */
  subArea?: string;
  derived?: Requirement;
  fallback?: Requirement;
  reachAny?: readonly ScreenId[];
  now?: PresenceCondition;
  derivedDungeon?: CheckRecord['derivedDungeon'];
  statusOnly?: true;
  /** What the event asks for beyond reaching its screen, in items and earlier checks (the tracker's logic). */
  requirements?: Requirement;
  /** The character the moment is about, where one sprite stands for it. */
  actorId?: ActorId;
}

const eventId = (n: number): CheckId => `check-${String(EVENT_ID_BASE + n).padStart(3, '0')}` as CheckId;

const eventRecord = (spec: EventSpec): CheckRecord => {
  const { n, name, group, gameId = {}, dungeonId, subArea, derived, fallback, reachAny, now, derivedDungeon, statusOnly, requirements, actorId } = spec;
  return {
    id: eventId(n),
    gameId,
    kind: 'event',
    name: name,
    vanillaItemIds: [],
    eventGroup: group,
    // An event lists under the screen it happens on, like any item check (event-screens.data.ts).
    ...(EVENT_SCREENS[n] !== undefined ? { screenId: EVENT_SCREENS[n] } : {}),
    // And in the region that screen belongs to, or the wing its dungeon is entered through
    // (event-regions.data.ts). A row standing for no place carries neither.
    ...(EVENT_REGIONS[n] !== undefined ? { regionId: EVENT_REGIONS[n] } : {}),
    ...(dungeonId !== undefined ? { dungeonId } : {}),
    ...(subArea !== undefined ? { subArea } : {}),
    ...(derived !== undefined ? { derived } : {}),
    ...(fallback !== undefined ? { fallback } : {}),
    ...(reachAny !== undefined ? { reachAny } : {}),
    ...(now !== undefined ? { now } : {}),
    ...(derivedDungeon !== undefined ? { derivedDungeon } : {}),
    ...(statusOnly ? { statusOnly } : {}),
    ...(requirements !== undefined ? { requirements } : {}),
    ...(actorId !== undefined ? { actorId } : {}),
  };
};

export { EVENT_ID_BASE, eventId, eventRecord };
export type { EventSpec };
