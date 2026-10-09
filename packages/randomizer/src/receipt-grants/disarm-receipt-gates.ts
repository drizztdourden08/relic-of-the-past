/* @layer bridge-wasm @kind logic */
import { setReceiptGrantsActive, reassertGateWord3 } from '@rotp/game-core';

const disarmReceiptGates = (): void => {
  setReceiptGrantsActive(false);
  reassertGateWord3();
};

export { disarmReceiptGates };
