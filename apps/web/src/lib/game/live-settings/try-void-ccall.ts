/* @layer bridge-wasm @kind logic */
import { getModule } from '../wasm-bridge';
import { callIfExported } from './call-if-exported';

const tryVoidCcall = (fn: string, value: number): void => {
  const mod = getModule();
  if (!mod) return;
  callIfExported(() => mod.ccall(fn, null, ['number'], [value]));
};

export { tryVoidCcall };
