/* @layer bridge-wasm @kind logic */
import { setSessionGate } from '../../session-gate-flags';

const setShopOverridesActive = (on: boolean): void => setSessionGate('shopOverrides', on);

export { setShopOverridesActive };
