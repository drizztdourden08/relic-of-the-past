/* @layer shared-game @kind constants */
const GameplayEvents = {
  LOCATION_CHECKED: 'location_checked',
  ITEM_RECEIVED: 'item_received',
  DUNGEON_ENTERED: 'dungeon_entered',
  ROOM_CHANGED: 'room_changed',
  DEATH: 'death',
  GOAL_COMPLETED: 'goal_completed',
} as const;

const SaveEvents = {
  SAVE_LOADED: 'save_loaded',
  SAVE_CREATED: 'save_created',
  SAVE_UPDATED: 'save_updated',
} as const;

const RandomizerEvents = {
  SEED_LOADED: 'seed_loaded',
  SPOILER_LOADED: 'spoiler_loaded',
  HINT_RECEIVED: 'hint_received',
} as const;

export { GameplayEvents, RandomizerEvents, SaveEvents };
