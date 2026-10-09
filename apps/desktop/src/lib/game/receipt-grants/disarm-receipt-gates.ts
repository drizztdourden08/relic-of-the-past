/* @layer bridge-wasm @kind logic */
import { setReceiptGrantsActive } from '@rotp/game-core';
import { reassertGateWord3 } from '../live-settings';

const disarmReceiptGates = (): void => {
  setReceiptGrantsActive(false);
  reassertGateWord3();
};

export { disarmReceiptGates };
