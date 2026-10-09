/* @layer bridge-wasm @kind logic */
import { setSessionGate } from '../../session-gate-flags';

const setRetroBowActive = (on: boolean): void => setSessionGate('retroBow', on);

export { setRetroBowActive };
