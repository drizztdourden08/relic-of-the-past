/* @layer bridge-wasm @kind logic */
import type { ScreenTable } from '@rotp/asset-extraction';
import { lifecycleState } from './lifecycle-state';

const setLanguageScreens = (tables: readonly ScreenTable[]): void => {
  lifecycleState.pendingLanguageScreens = tables;
};

export { setLanguageScreens };
