/* @layer bridge-wasm @kind logic */
import { getModule } from '../../wasm-bridge';

const shopSlotAlreadySold = (slotIndex: number, depthIndex: number): boolean => {
  const mod = getModule();
  if (!mod) return false;
  const sold = mod.ccall('WasmGetShopSlotSold', 'number', ['number'], [slotIndex]) as number;
  return depthIndex < sold;
};

export { shopSlotAlreadySold };
