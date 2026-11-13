/* @layer renderer-other @kind constants */
const LIVE_ASPECT_SETTLE_MS = 250;

const GAME_VIEW_RESIZED_EVENT = 'rotp:game-view-resized';

const LIVE_ASPECT_MODES: ReadonlySet<string> = new Set(['auto', 'screen']);

export { GAME_VIEW_RESIZED_EVENT, LIVE_ASPECT_MODES, LIVE_ASPECT_SETTLE_MS };
