/* @layer bridge-wasm @kind logic */
import { getModule } from '@rotp/game-core';

const shopSlotAlreadySold = (slotIndex: number, depthIndex: number): boolean => {
  const mod = getModule();
  if (!mod) return false;
  const sold = mod.ccall('WasmGetShopSlotSold', 'number', ['number'], [slotIndex]);
  return depthIndex < sold;
};

export { shopSlotAlreadySold };
