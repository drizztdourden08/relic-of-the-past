/* @layer shared-game @kind data */
import type { CheckId } from '@rotp/game-data';

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

const GOAL_EVENT: CheckId = STORY_EVENT.ganonBeaten;

const WORLD_EVENT_IDS: readonly CheckId[] = [
  STORY_EVENT.ganonBeaten,
  STORY_EVENT.agahnim1Beaten,
  STORY_EVENT.agahnim2Beaten,
  STORY_EVENT.purpleChestFound,
  STORY_EVENT.frogFound,
  STORY_EVENT.smithsReunited,
  STORY_EVENT.floodgateLeverPulled,
  STORY_EVENT.weathervaneOpened,
];

export { GOAL_EVENT, STORY_EVENT, WORLD_EVENT_IDS };
