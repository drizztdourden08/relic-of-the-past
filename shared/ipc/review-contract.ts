/* @layer shared-ipc @kind types */
/**
 * Wire types for the review store's two channels (`review:load`, `review:save`).
 * The entry/file shapes ARE the domain model itself (shared/game/review/types.ts) —
 * IPC carries them unchanged, so this file only re-exports them for the contract,
 * the same bargain `ui-views-contract.ts` makes for `UiViewsMap`.
 */
export type { ReviewEntry, ReviewFile } from '../game/review/types';
