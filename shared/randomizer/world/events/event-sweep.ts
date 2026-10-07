/* @layer shared-game @kind logic */
/**
 * Finding the story events of the world (story-events.data.ts) the way the player makes them
 * happen: an event is done once its region is reachable and its own rule holds, and doing it
 * can open more. A sweep grants those events as it goes, beside the items it collects.
 *
 * A world reading a save's record never infers one. Whether the floodgate lever was pulled is
 * a fact the game wrote down, not something to guess from the lever being within walking
 * distance, so such a world holds exactly the events its record lists (events/event-gates.ts).
 */
import type { CheckId } from '@shared/game/data/types/ids';
import type { CollectionState } from '../collection-state';

/** Whether this state can make the event happen now: its place is reached and its rule holds. */
const canReachEvent = (state: CollectionState, key: CheckId): boolean => {
  const event = state.world.eventsByKey.get(key);
  if (event === undefined) return false;
  if (!state.canReachRegion(event.region)) return false;
  const rule = state.world.getEventRule(key);
  return rule === undefined || rule(state);
};

/** The events within reach of this state that it does not hold yet; none while a record is attached. */
const reachableEvents = (state: CollectionState): CheckId[] => {
  if (state.world.options.actTokens !== undefined) return [];
  return [...state.world.eventsByKey.keys()].filter((key) => !state.has(key) && canReachEvent(state, key));
};

/** Grants every event within reach, again and again, until one pass grants nothing. */
const collectReachableEvents = (state: CollectionState): void => {
  for (let batch = reachableEvents(state); batch.length > 0; batch = reachableEvents(state)) {
    for (const key of batch) state.collect(key);
  }
};

export { canReachEvent, collectReachableEvents, reachableEvents };
