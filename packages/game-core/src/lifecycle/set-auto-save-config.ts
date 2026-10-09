/* @layer bridge-wasm @kind logic */
import { lifecycleState } from './lifecycle-state';
import type { AutoSaveConfig } from './lifecycle.type';

const setAutoSaveConfig = (config: AutoSaveConfig | null): void => {
  lifecycleState.activeAutoSaveConfig = config;
};

export { setAutoSaveConfig };
