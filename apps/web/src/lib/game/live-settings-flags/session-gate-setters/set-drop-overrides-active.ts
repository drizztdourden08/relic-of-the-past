/* @layer bridge-wasm @kind logic */
import { setSessionGate } from '../../session-gate-flags';

const setDropOverridesActive = (on: boolean): void => setSessionGate('dropOverrides', on);

export { setDropOverridesActive };
