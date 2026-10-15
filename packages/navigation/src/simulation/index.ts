/* @layer shared-game @kind barrel */
export type { SimPhase, SimOutcome, SimConfig, SimEvent, DatasetSuggestion, SoftlockReport } from './types/run.type';
export type { VirtualPlayer, FlagSnapshot, SimObservation, SimLocation, ScreenGridBundle } from './types/observation.type';
export type { SimExit, SimArea } from './types/exit.type';
export type { TriggerAction } from './types/trigger-action.type';
export type { DetectedCheck } from './types/flag-diff.type';
export type { SimChest, SimSprite, SimDoor } from './types/interactable.type';
export type { CombatContext } from './types/combat.type';

export type { SimulatorPort } from './port.type';

export { inventoryToReachTokens } from './requirements-map/inventory-to-reach-tokens';
export { requirementsMet } from './requirements-map/requirements-met';
export type { ReachContext } from './requirements-map';
export type { TraversalId } from './traversal-id.type';

export { createEngine } from './engine/engine';
export { createEngineState } from './engine/state';
export { screenLabel } from './engine/screen-label';
export type { EngineState } from './engine/state';
export {
  buildAdjacency,
  reachableFrom,
} from './engine/traversal';
export type { ScreenEdge, CanPass } from './engine/traversal';
export { buildSoftlockReport } from './engine/softlock-report';

export { npcConfigForSprite, checkForStandingItem } from './trigger/trigger-plans';
export { arrivalLabel } from './engine/hop/arrival-label';
export { buildEndSummary, formatEndSummary } from './engine/end-summary';

export { emptySnapshot } from './detect/flag-snapshot';

export { createRecorder, recordCheck, recordTransition, recordDoorGate } from './recording/recorder';
export type { RecorderState } from './recording/recorder';
export { buildDatasetSuggestions } from './recording/dataset-updates';

export { buildSimRunReport } from './sim-run/report';
export type { SimRunConfig } from './sim-run/sim-run.type';

export { buildPresenceState, emptyPresenceState } from './presence';
export type { AnnotationKind, ScreenAnnotation, ScreenAnnotations, ScreenTag } from './annotations.type';
export { roomTagName } from './room-tags';
