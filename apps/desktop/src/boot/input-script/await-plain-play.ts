/* @layer renderer-app @kind logic */
import { log } from '@app/log-bus';
import { launchesConnection } from '../auto-launch/launches-connection';
import { waitFrames } from '../screenshot-frames/wait-frames';
import { PLAIN_PLAY_CHUNK_FRAMES, PLAIN_PLAY_MAX_WAIT_MS, PLAIN_PLAY_STABLE_CHECKS } from './input-script.constants';
import { openBlockers } from './open-blockers';
import { runChunk } from './run-chunk';

const awaitPlainPlay = async (): Promise<void> => {
  if (!launchesConnection()) return;
  const deadline = Date.now() + PLAIN_PLAY_MAX_WAIT_MS;
  let stable = 0;
  let blockers = openBlockers();
  while (Date.now() < deadline) {
    blockers = openBlockers();
    stable = blockers.length === 0 ? stable + 1 : 0;
    if (stable >= PLAIN_PLAY_STABLE_CHECKS) {
      log.app('[InputScript] The game is in plain play with no receipt pending, the script starts');
      return;
    }
    if (!(await runChunk(PLAIN_PLAY_CHUNK_FRAMES))) return;
    await waitFrames(1);
  }
  log.app(`[InputScript] Still open after ${PLAIN_PLAY_MAX_WAIT_MS / 1000}s, playing anyway: ${blockers.join('; ')}`, 'warn');
};

export { awaitPlainPlay };
