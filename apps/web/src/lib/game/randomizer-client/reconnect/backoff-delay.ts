/* @layer bridge-wasm @kind logic */
import { BACKOFF_MAX_MS, BACKOFF_START_MS } from './reconnect.constants';

const backoffDelay = (attempt: number): number => Math.min(BACKOFF_START_MS * 2 ** attempt, BACKOFF_MAX_MS);

export { backoffDelay };
