/* @layer bridge-wasm @kind constants */
import type { KillOutcome } from './ap-kill-link.type';

const DEATH_LINK_GUARD_MS = 5000;

const KILL_LOG_NOTE: Record<KillOutcome, string> = {
  armed: '',
  down: ' (already down)',
  unsupported: ' (this core cannot kill Link)',
};

const MS_PER_SECOND = 1000;

export { DEATH_LINK_GUARD_MS, KILL_LOG_NOTE, MS_PER_SECOND };
