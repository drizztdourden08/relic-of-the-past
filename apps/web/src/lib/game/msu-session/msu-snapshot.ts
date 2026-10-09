/* @layer bridge-wasm @kind logic */
import type { MsuResumeState } from '@shared/types/msu-manifest';
import { msuSessionState } from './msu-session-state';

const msuSnapshot = (): MsuResumeState | null => msuSessionState.engine?.snapshot() ?? null;

export { msuSnapshot };
