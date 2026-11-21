/* @layer bridge-wasm @kind logic */
import type { ScreenTable } from '@rotp/asset-extraction';
import { lifecycleState } from './lifecycle-state';

const setJapaneseGraphics = (tables: readonly ScreenTable[]): void => {
  lifecycleState.pendingJapaneseGraphics = tables;
};

export { setJapaneseGraphics };
