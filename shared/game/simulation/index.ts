/* @layer shared-game @kind barrel */
export type {
  SimPhase,
  SimOutcome,
  SimConfig,
  VirtualPlayer,
  FlagSnapshot,
  SimObservation,
  SimExit,
  SimArea,
  SimLocation,
  ScreenGridBundle,
  RoomInteractables,
  TriggerAction,
  FlagBufferKind,
  FlagDiff,
  DetectedCheck,
  SimEvent,
  DatasetSuggestion,
  SoftlockReport,
  SimChest,
  SimSprite,
  SimDoor,
} from './types';

export type { SimulatorPort } from './port';

export {
  ITEM_TO_TOKEN,
  BARRIER_TO_TOKEN,
  inventoryToReachTokens,
  barrierTagsToRequirements,
  requirementsMet,
  affectsTraversal,
} from './requirements-map';
export type { ReachContext } from './requirements-map';

export { createEngine } from './engine/engine';
export type { EngineDeps, StepResult } from './engine/engine';
export { createEngineState, cloneState } from './engine/state';
export { screenLabel } from './engine/step-helpers';
export type { EngineState, SimTarget } from './engine/state';
export {
  buildAdjacency,
  connectionRequirements,
  findScreenPath,
  reachableFrom,
  toRoute,
  toScreenPath,
} from './engine/traversal';
export type { Adjacency, ScreenEdge, CanPass } from './engine/traversal';
export { evaluateOutcome, goalCheckDone, allChecksDone, frontierExhausted } from './engine/goal';
export {
  canonicalDungeon,
  dungeonFromKeyItem,
  syncReachTokens,
  keyAvailable,
  buildReachContext,
  spendKey,
  addKey,
  applyItem,
  resetFrontier,
  markDoneAndContinue,
  onCheckVerified,
} from './engine/explorer';
export { buildSoftlockReport } from './engine/softlock-report';

export { planTrigger, planChestTrigger, planSpriteTrigger, npcConfigForSprite } from './trigger/trigger-plans';
export { buildEndSummary, formatEndSummary } from './engine/end-summary';
export type { EndSummary } from './engine/end-summary';
export { bossTriggerable, isReachable, meetsRequirements, bossRequirement } from './trigger/boss-gate';
export type { BossSite } from './trigger/boss-gate';

export { emptySnapshot, cloneSnapshot, diffSnapshots } from './detect/flag-snapshot';
export { matchDiff, matchDiffs, UNKNOWN } from './detect/check-matcher';

export { createRecorder, recordCheck, recordTransition, recordDoorGate } from './recording/recorder';
export type { RecorderState, ObservedCheck, ObservedTransition, ObservedDoorGate } from './recording/recorder';
export { buildDatasetSuggestions } from './recording/dataset-updates';

export { buildSimRunReport } from './sim-run/report';
export type { SimRunConfig, SimRunReport, BoundaryEdge } from './sim-run/types';

export { evaluatePresence, buildPresenceState, emptyPresenceState, BOSS_DEAD_BIT } from './presence';
export type { PresenceGameState, PresenceStateInput, PresenceCondition, BitState } from './presence';
export type { AnnotationKind, AnnotationState, ScreenAnnotation, ScreenAnnotations, ScreenTag } from './annotations';
export { roomTagName } from './room-tags';
