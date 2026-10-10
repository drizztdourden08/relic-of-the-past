/* @layer tests @kind constants */
const POLL_TIMEOUT_MS = 60_000;
const POLL_STEP_MS = 500;
const FLOOD_SETTLE_LIMIT_MS = 20_000;
const STATE_WORDS = new Set(['open', 'shut', 'done', 'available', 'unreachable']);

export { FLOOD_SETTLE_LIMIT_MS, POLL_STEP_MS, POLL_TIMEOUT_MS, STATE_WORDS };
