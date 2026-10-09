/* @layer bridge-wasm @kind logic */
import { lifecycleState } from './lifecycle-state';

const setLinkSpriteData = (data: Uint8Array | null): void => {
  lifecycleState.pendingLinkSprite = data;
};

export { setLinkSpriteData };
