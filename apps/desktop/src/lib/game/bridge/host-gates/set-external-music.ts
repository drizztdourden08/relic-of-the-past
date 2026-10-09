/* @layer bridge-wasm @kind logic */
import { HOST_GATE_EXTERNAL_MUSIC } from './host-gates.constants';
import { setHostGateBit } from './set-host-gate-bit';

const setExternalMusic = (on: boolean): void => setHostGateBit(HOST_GATE_EXTERNAL_MUSIC, on);

export { setExternalMusic };
