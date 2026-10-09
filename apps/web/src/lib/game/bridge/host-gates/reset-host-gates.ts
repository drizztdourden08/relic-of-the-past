/* @layer bridge-wasm @kind logic */
import { hostGateMirror } from './host-gate-mirror';

const resetHostGates = (): void => { hostGateMirror.word = 0; };

export { resetHostGates };
