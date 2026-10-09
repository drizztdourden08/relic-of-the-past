/* @layer bridge-wasm @kind logic */
import { setReceiptGrantsActive } from '@rotp/game-core';
import { reassertGateWord3 } from '@rotp/game-core';

const armReceiptGates = (): void => {
  setReceiptGrantsActive(true);
  reassertGateWord3();
};

export { armReceiptGates };
