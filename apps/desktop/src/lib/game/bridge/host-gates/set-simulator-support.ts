/* @layer bridge-wasm @kind logic */
import { HOST_GATE_SIMULATOR_SUPPORT } from './host-gates.constants';
import { setHostGateBit } from './set-host-gate-bit';

const setSimulatorSupport = (on: boolean): void => setHostGateBit(HOST_GATE_SIMULATOR_SUPPORT, on);

export { setSimulatorSupport };
