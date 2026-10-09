/* @layer bridge-wasm @kind logic */
import { armedShopState } from './armed-shop-state';

const clearArmedShopEntries = (): void => {
  armedShopState.entries = [];
};

export { clearArmedShopEntries };
