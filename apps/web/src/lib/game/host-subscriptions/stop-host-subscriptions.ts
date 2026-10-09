/* @layer bridge-wasm @kind logic */
import { initGearOwnership } from '../gear-ownership';

const stopHostSubscriptions = (): void => initGearOwnership(null);

export { stopHostSubscriptions };
