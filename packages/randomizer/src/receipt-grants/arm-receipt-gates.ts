/* @layer bridge-wasm @kind logic */
import { setReceiptGrantsActive, reassertGateWord3 } from '@rotp/game-core';

const armReceiptGates = (): void => {
  setReceiptGrantsActive(true);
  reassertGateWord3();
};

export { armReceiptGates };
