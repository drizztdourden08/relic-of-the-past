/* @layer bridge-wasm @kind logic */
import { setSessionGate } from '../../session-gate-flags';

const setPondPlanActive = (on: boolean): void => setSessionGate('pondPlan', on);

export { setPondPlanActive };
