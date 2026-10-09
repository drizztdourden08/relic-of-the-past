/* @layer bridge-wasm @kind logic */
import { setReceiptGrantsActive } from '../live-settings-flags';
import { reassertGateWord3 } from '../live-settings';

const armReceiptGates = (): void => {
  setReceiptGrantsActive(true);
  reassertGateWord3();
};

export { armReceiptGates };
