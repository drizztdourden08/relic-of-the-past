/* @layer bridge-wasm @kind logic */
import { getModule } from '../wasm-bridge';

const armNextReceiptMessage = (messageId: number): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmSetNextReceiptMessage', null, ['number'], [messageId]);
};

export { armNextReceiptMessage };
