/* @layer shared-game @kind barrel */
export type { SimPhase, SimOutcome, SimConfig, SimEvent, DatasetSuggestion, SoftlockReport } from './types/run.type';
export type { VirtualPlayer, FlagSnapshot, SimObservation, SimLocation, ScreenGridBundle, RoomInteractables } from './types/observation.type';
export type { SimExit, SimArea } from './types/exit.type';
export type { TriggerAction } from './types/trigger-action.type';
export type { FlagBufferKind, FlagDiff, DetectedCheck } from './types/flag-diff.type';
export type { SimChest, SimSprite, SimDoor } from './types/interactable.type';
export type { SpriteCombatInfo, CombatTables, CombatContext } from './types/combat.type';
export type { RoomSectionSplit } from '@rotp/game-core';

export type { SimulatorPort } from './port.type';

export { ITEM_TO_TOKEN, BARRIER_TO_TOKEN } from '@rotp/game-data';
export { inventoryToReachTokens } from './requirements-map/inventory-to-reach-tokens';
export { barrierTagsToRequirements } from './requirements-map/barrier-tags-to-requirements';
export { requirementsMet } from './requirements-map/requirements-met';
export { affectsTraversal } from './requirements-map/affects-traversal';
export type { ReachContext } from './requirements-map';
export type { KeyTarget } from './dungeon-key-target';
export type { TraversalId } from './traversal-id.type';

export { createEngine } from './engine/engine';
export type { EngineDeps, StepResult } from './engine/engine';
export { createEngineState, cloneState } from './engine/state';
export { screenLabel } from './engine/screen-label';
export type { EngineState, SimTarget, SimTargetRole } from './engine/state';
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

export { planTrigger, planChestTrigger, planSpriteTrigger, npcConfigForSprite, checkForStandingItem } from './trigger/trigger-plans';
export { arrivalLabel } from './engine/hop/arrival-label';
export { buildEndSummary, formatEndSummary } from './engine/end-summary';
export type { EndSummary } from './engine/end-summary';
export { bossTriggerable, isReachable, meetsRequirements, bossRequirement } from './trigger/boss-gate';
export type { BossSite } from './trigger/boss-gate';

export { emptySnapshot, cloneSnapshot, diffSnapshots } from './detect/flag-snapshot';
export { matchDiff, matchDiffs } from './detect/check-matcher';

export { createRecorder, recordCheck, recordTransition, recordDoorGate } from './recording/recorder';
export type { RecorderState, ObservedCheck, ObservedTransition, ObservedDoorGate } from './recording/recorder';
export { buildDatasetSuggestions } from './recording/dataset-updates';

export { buildSimRunReport } from './sim-run/report';
export type { SimRunConfig, SimRunReport, BoundaryEdge } from './sim-run/sim-run.type';

export { evaluatePresence, buildPresenceState, emptyPresenceState, BOSS_DEAD_BIT } from './presence';
export type { PresenceGameState, PresenceStateInput } from './presence/presence.type';
export type { PresenceCondition, BitState } from '@rotp/game-data';
export type { AnnotationKind, AnnotationState, ScreenAnnotation, ScreenAnnotations, ScreenTag } from './annotations.type';
export { roomTagName } from './room-tags';
