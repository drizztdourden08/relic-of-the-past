/* @layer renderer-app @kind constants */
const PRESS_FRAMES = 3;

const MAX_SCRIPT_FRAMES = 1_000_000;

const STEP_CHUNK_FRAMES = 600;

const MAX_STEP_WAIT_TICKS = 2_000;

const PLAIN_PLAY_MAX_WAIT_MS = 60_000;

const PLAIN_PLAY_CHUNK_FRAMES = 20;

const PLAIN_PLAY_STABLE_CHECKS = 3;

const BLOCKER_SYNC_PENDING = 'the online session has not finished its first sync';

const BLOCKER_NOT_IN_PLAIN_PLAY = 'the game is not in plain play (a message box, menu or transition is open)';

const BLOCKER_RECEIPTS_QUEUED = 'receipt(s) still queued or being delivered';

export {
  BLOCKER_NOT_IN_PLAIN_PLAY, BLOCKER_RECEIPTS_QUEUED, BLOCKER_SYNC_PENDING, MAX_SCRIPT_FRAMES, MAX_STEP_WAIT_TICKS, PLAIN_PLAY_CHUNK_FRAMES,
  PLAIN_PLAY_MAX_WAIT_MS, PLAIN_PLAY_STABLE_CHECKS, PRESS_FRAMES, STEP_CHUNK_FRAMES,
};
