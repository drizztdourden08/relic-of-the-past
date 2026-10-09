/* @layer bridge-wasm @kind logic */
import { setSessionGate } from '../../session-gate-flags';

const setStandingOverridesActive = (on: boolean): void => setSessionGate('standingOverrides', on);

export { setStandingOverridesActive };
