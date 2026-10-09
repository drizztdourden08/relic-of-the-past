/* @layer bridge-wasm @kind logic */
import { fireRegistryState } from './fire-registry-state';

const isCheckPhysicallyArmed = (checkId: string): boolean => fireRegistryState.armedCheckIds.has(checkId);

export { isCheckPhysicallyArmed };
