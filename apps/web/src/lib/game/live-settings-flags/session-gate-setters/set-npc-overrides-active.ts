/* @layer bridge-wasm @kind logic */
import { setSessionGate } from '../../session-gate-flags';

const setNpcOverridesActive = (on: boolean): void => setSessionGate('npcOverrides', on);

export { setNpcOverridesActive };
