/* @layer bridge-wasm @kind logic */
import { setReceiptGrantsActive } from '@rotp/game-core';
import { reassertGateWord3 } from '../live-settings';

const armReceiptGates = (): void => {
  setReceiptGrantsActive(true);
  reassertGateWord3();
};

export { armReceiptGates };
