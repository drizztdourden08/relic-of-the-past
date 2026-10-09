/* @layer renderer-lib @kind types */
interface EffectChain {
  input: AudioNode;
  output: AudioNode;
  dispose: () => void;
}

export type { EffectChain };
