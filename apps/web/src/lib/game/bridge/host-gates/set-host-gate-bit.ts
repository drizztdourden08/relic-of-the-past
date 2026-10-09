/* @layer bridge-wasm @kind logic */
import { hostGateMirror } from './host-gate-mirror';
import { pushHostGateWord } from './push-host-gate-word';

const setHostGateBit = (bit: number, on: boolean): void => {
  const next = on ? hostGateMirror.word | bit : hostGateMirror.word & ~bit;
  if (next === hostGateMirror.word) return;
  hostGateMirror.word = next;
  pushHostGateWord();
};

export { setHostGateBit };
