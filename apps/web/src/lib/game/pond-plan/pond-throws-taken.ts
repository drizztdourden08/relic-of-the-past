/* @layer bridge-wasm @kind logic */
import { getModule } from '../wasm-bridge';

const pondThrowsTaken = (): number => {
  const mod = getModule();
  return mod ? (mod.ccall('WasmPondThrowsTaken', 'number', [], []) as number) : 0;
};

export { pondThrowsTaken };
