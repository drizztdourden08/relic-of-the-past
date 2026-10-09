/* @layer renderer-lib @kind constants */
import type { VibrateResult } from '@drizztdourden08/brock-input';

const HID_WORKER_OVERHEAD_MS = 20;
const DEBUG_LOG_INTERVAL_MS = 1000;
const INPUT_UNAVAILABLE: VibrateResult = { ok: false, error: 'Controller input is not available on this host.' };

export { HID_WORKER_OVERHEAD_MS, DEBUG_LOG_INTERVAL_MS, INPUT_UNAVAILABLE };
