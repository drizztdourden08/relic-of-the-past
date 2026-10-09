/* @layer renderer-components @kind types */
interface MotionPreview {
  nowMs: number | null;
  playing: boolean;
  spanMs: number;
  disabled: boolean;
  play: () => void;
  pause: () => void;
  scrubTo: (ms: number) => void;
  setSpan: (ms: number) => void;
}

export type { MotionPreview };
