/* @layer bridge-wasm @kind logic */
import type { MsuResumeState } from '@rotp/game-data';
import { msuSessionState } from './msu-session-state';

const msuSnapshot = (): MsuResumeState | null => msuSessionState.engine?.snapshot() ?? null;

export { msuSnapshot };
