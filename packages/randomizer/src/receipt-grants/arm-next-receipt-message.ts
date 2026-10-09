/* @layer bridge-wasm @kind logic */
import { getModule } from '@rotp/game-core';

const armNextReceiptMessage = (messageId: number): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmSetNextReceiptMessage', null, ['number'], [messageId]);
};

export { armNextReceiptMessage };
