/* @layer shared-ipc @kind types */
/**
 * Wire types for the recommendation store's three channels. The engine's own
 * shapes ARE the domain model (shared/game/recommendations), and IPC carries
 * them unchanged, so this file only re-exports them for the contract — the same
 * bargain `review-contract.ts` and `ui-views-contract.ts` make.
 *
 * Everything crossing here is already plain data by construction: a detector may
 * not hold a module handle or a wasm pointer (see detection-types.ts), which is
 * exactly what makes a pass structured-cloneable without a translation layer.
 */
export type { DetectionContext } from '../game/recommendations/detection-types';
export type { PassResult } from '../game/recommendations/store';
export type { DraftRecommendation, Recommendation } from '../game/recommendations/types';
