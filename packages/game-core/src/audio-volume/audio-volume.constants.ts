/* @layer bridge-wasm @kind constants */
const GESTURE_EVENTS = ['pointerdown', 'touchend', 'keydown', 'click'] as const;
const PENDING_POLL_MS = 50;
const DEFAULT_VOLUME = 100;

export { GESTURE_EVENTS, PENDING_POLL_MS, DEFAULT_VOLUME };
