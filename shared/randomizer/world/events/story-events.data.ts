/* @layer shared-game @kind data */
/**
 * The story events the solver finds in the world.
 *
 * Each one is a ledger record (records/checks/events/story.ts) that the rules ask about and
 * that happens at one place: the region its own record names, under the rule the tables give
 * it. A seed never fills one and never counts one as a location. The sweep grants the event
 * the moment its place and its rule are both in reach, the way the player makes it happen, and
 * a world reading a save's record takes it from the record instead (event-sweep.ts).
 *
 * Every other act of the ledger answers to the capability that performs it (event-gates.data.ts).
 * These eight are different because their requirement is a PLACE as much as an inventory: a
 * boss room, the smiths' hut, a lever in the dam.
 */
import type { CheckId } from '@shared/game/data/types/ids';

const STORY_EVENT = {
  ganonBeaten: 'check-351',
  agahnim1Beaten: 'check-329',
  agahnim2Beaten: 'check-349',
  purpleChestFound: 'check-337',
  frogFound: 'check-335',
  smithsReunited: 'check-336',
  floodgateLeverPulled: 'check-326',
  weathervaneOpened: 'check-324',
} as const satisfies Record<string, CheckId>;

/** The goal of every seed: the game is beaten once Ganon is. */
const GOAL_EVENT: CheckId = STORY_EVENT.ganonBeaten;

/** Every story event the world holds, in the order the sweep asks them. */
const WORLD_EVENT_IDS: readonly CheckId[] = Object.values(STORY_EVENT);

export { GOAL_EVENT, STORY_EVENT, WORLD_EVENT_IDS };
