// Shared type definitions for Relic of the Past

/** Events emitted by the game core */
interface GameEvent {
  type: string;
  timestamp: number;
  payload: unknown;
}

// Re-export game domain types from their canonical location
export type { SeedData, LocationEntry, GoalMode, MedallionConfig, SaveMeta } from '../game/seed';

export type { GameEvent };
