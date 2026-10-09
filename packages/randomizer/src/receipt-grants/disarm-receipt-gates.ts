/* @layer bridge-wasm @kind logic */
import { setReceiptGrantsActive } from '@rotp/game-core';
import { reassertGateWord3 } from '@rotp/game-core';

const disarmReceiptGates = (): void => {
  setReceiptGrantsActive(false);
  reassertGateWord3();
};

export { disarmReceiptGates };
