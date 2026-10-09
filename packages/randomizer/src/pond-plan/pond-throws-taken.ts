/* @layer bridge-wasm @kind logic */
import { getModule } from '@rotp/game-core';

const pondThrowsTaken = (): number => {
  const mod = getModule();
  return mod ? (mod.ccall('WasmPondThrowsTaken', 'number', [], [])) : 0;
};

export { pondThrowsTaken };
