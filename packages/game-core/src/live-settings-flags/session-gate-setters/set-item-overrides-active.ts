/* @layer bridge-wasm @kind logic */
import { setSessionGate } from '../../session-gate-flags';

const setItemOverridesActive = (on: boolean): void => setSessionGate('itemOverrides', on);

export { setItemOverridesActive };
