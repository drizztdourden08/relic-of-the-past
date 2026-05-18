// Event name constants for the game core ↔ React bridge

export const GameplayEvents = {
  LOCATION_CHECKED: 'location_checked',
  ITEM_RECEIVED: 'item_received',
  DUNGEON_ENTERED: 'dungeon_entered',
  ROOM_CHANGED: 'room_changed',
  DEATH: 'death',
  GOAL_COMPLETED: 'goal_completed',
} as const;

export const SaveEvents = {
  SAVE_LOADED: 'save_loaded',
  SAVE_CREATED: 'save_created',
  SAVE_UPDATED: 'save_updated',
} as const;

export const RandomizerEvents = {
  SEED_LOADED: 'seed_loaded',
  SPOILER_LOADED: 'spoiler_loaded',
  HINT_RECEIVED: 'hint_received',
} as const;

export type GameplayEventType = (typeof GameplayEvents)[keyof typeof GameplayEvents];
export type SaveEventType = (typeof SaveEvents)[keyof typeof SaveEvents];
export type RandomizerEventType = (typeof RandomizerEvents)[keyof typeof RandomizerEvents];
export type CoreEventType = GameplayEventType | SaveEventType | RandomizerEventType;
