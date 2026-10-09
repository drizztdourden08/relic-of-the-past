/* @layer bridge-wasm @kind logic */
import { HOST_GATE_EXTERNAL_SFX } from './host-gates.constants';
import { setHostGateBit } from './set-host-gate-bit';

const setExternalSfx = (on: boolean): void => setHostGateBit(HOST_GATE_EXTERNAL_SFX, on);

export { setExternalSfx };
