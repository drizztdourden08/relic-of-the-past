/* @layer shared-game @kind barrel */
export type { SimPhase, SimOutcome, SimConfig, SimEvent, DatasetSuggestion, SoftlockReport } from './run.type';
export type { VirtualPlayer, FlagSnapshot, SimLocation, ScreenGridBundle, RoomInteractables, SimObservation } from './observation.type';
export type { SimArea, SimExitOrigin, SimExit } from './exit.type';
export type { SpriteCombatInfo, CombatTables, CombatContext } from './combat.type';
export type { SimChest, SimSprite, SimDoor } from './interactable.type';
export type { TriggerAction } from './trigger-action.type';
export type { FlagBufferKind, FlagDiff, DetectedCheck } from './flag-diff.type';
export type { RoomSectionSplit } from '@rotp/game-core';
