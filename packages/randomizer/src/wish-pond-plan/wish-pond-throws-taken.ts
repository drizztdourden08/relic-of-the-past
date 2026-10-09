/* @layer bridge-wasm @kind logic */
import { getModule } from '@rotp/game-core';

const wishPondThrowsTaken = (pond: number): number => {
  const mod = getModule();
  return mod ? (mod.ccall('WasmWishPondThrowsTaken', 'number', ['number'], [pond])) : 0;
};

export { wishPondThrowsTaken };
