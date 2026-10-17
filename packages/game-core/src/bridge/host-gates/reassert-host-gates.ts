/* @layer bridge-wasm @kind logic */
import { pushHostGateWord } from './push-host-gate-word';

const reassertHostGates = (): void => pushHostGateWord();

export { reassertHostGates };
