/* @layer bridge-wasm @kind logic */
import { setSessionGate } from '../../session-gate-flags';

const setScriptedGrantsActive = (on: boolean): void => setSessionGate('scriptedGrants', on);

export { setScriptedGrantsActive };
