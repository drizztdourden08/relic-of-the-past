/* @layer renderer-components @kind types */
interface Audition {
  positionSeconds: () => number;
  durationSeconds: number;
  loopSeconds: number | null;
  stop: () => void;
}

interface AuditionState {
  context: AudioContext | null;
  playing: AudioBufferSourceNode | null;
}

export type { Audition, AuditionState };
