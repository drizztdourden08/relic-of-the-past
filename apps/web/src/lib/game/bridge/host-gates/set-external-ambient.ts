/* @layer bridge-wasm @kind logic */
import { HOST_GATE_EXTERNAL_AMBIENT } from './host-gates.constants';
import { setHostGateBit } from './set-host-gate-bit';

const setExternalAmbient = (on: boolean): void => setHostGateBit(HOST_GATE_EXTERNAL_AMBIENT, on);

export { setExternalAmbient };
