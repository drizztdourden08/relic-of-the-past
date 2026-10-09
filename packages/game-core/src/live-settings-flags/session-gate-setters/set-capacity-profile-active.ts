/* @layer bridge-wasm @kind logic */
import { setSessionGate } from '../../session-gate-flags';

const setCapacityProfileActive = (on: boolean): void => setSessionGate('capacityProfile', on);

export { setCapacityProfileActive };
