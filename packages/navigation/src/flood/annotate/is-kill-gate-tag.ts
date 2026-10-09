/* @layer bridge-wasm @kind logic */
import { KILL_GATE_TAG_FIRST, KILL_GATE_TAG_LAST } from './kill-gate.constants';

const isKillGateTag = (t: number): boolean => t >= KILL_GATE_TAG_FIRST && t <= KILL_GATE_TAG_LAST;

export { isKillGateTag };
