/* @layer bridge-wasm @kind logic */
import { setSessionGate } from '../../session-gate-flags';

const setReceiptGrantsActive = (on: boolean): void => setSessionGate('receiptGrants', on);

export { setReceiptGrantsActive };
