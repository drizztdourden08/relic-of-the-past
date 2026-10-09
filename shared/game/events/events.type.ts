/* @layer shared-game @kind types */
import type { GameplayEvents, RandomizerEvents, SaveEvents } from './events.constants';

type GameplayEventType = (typeof GameplayEvents)[keyof typeof GameplayEvents];
type SaveEventType = (typeof SaveEvents)[keyof typeof SaveEvents];
type RandomizerEventType = (typeof RandomizerEvents)[keyof typeof RandomizerEvents];
type CoreEventType = GameplayEventType | SaveEventType | RandomizerEventType;

export type {
  CoreEventType,
  GameplayEventType,
  RandomizerEventType,
  SaveEventType
};
