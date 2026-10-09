/* @layer bridge-wasm @kind logic */
import { HOST_GATE_SOUND_TRACE } from './host-gates.constants';
import { setHostGateBit } from './set-host-gate-bit';

const setSoundTrace = (on: boolean): void => setHostGateBit(HOST_GATE_SOUND_TRACE, on);

export { setSoundTrace };
