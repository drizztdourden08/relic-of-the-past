/* @layer bridge-wasm @kind logic */
import { voidCall } from '../wasm-call';
import { HOST_GATE_WORD_INDEX } from './host-gates.constants';
import { hostGateMirror } from './host-gate-mirror';

const pushHostGateWord = (): void =>
  voidCall('WasmSetHostGateWord', { argTypes: ['number', 'number'], args: [HOST_GATE_WORD_INDEX, hostGateMirror.word] });

export { pushHostGateWord };
