/* @layer bridge-wasm @kind logic */
import { getModule } from '../wasm-bridge';

const wishPondThrowsTaken = (pond: number): number => {
  const mod = getModule();
  return mod ? (mod.ccall('WasmWishPondThrowsTaken', 'number', ['number'], [pond]) as number) : 0;
};

export { wishPondThrowsTaken };
