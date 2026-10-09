/* @layer bridge-wasm @kind logic */
import { hostGateMirror } from './host-gate-mirror';
import { pushHostGateWord } from './push-host-gate-word';

const reassertHostGates = (): void => { if (hostGateMirror.word !== 0) pushHostGateWord(); };

export { reassertHostGates };
