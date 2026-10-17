/* @layer bridge-wasm @kind logic */
import { callWhenRunning } from '../wasm-call';
import { HOST_GATE_WORD_INDEX } from './host-gates.constants';
import { hostGateMirror } from './host-gate-mirror';

const pushHostGateWord = (): void => {
  hostGateMirror.delivered = callWhenRunning(false, (mod) => {
    mod.ccall('WasmSetHostGateWord', null, ['number', 'number'], [HOST_GATE_WORD_INDEX, hostGateMirror.word]);
    return true;
  });
};

export { pushHostGateWord };
