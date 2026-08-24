/* @layer renderer-components @kind types */
interface CrossfadeFieldProps {
  /** Seconds of overlap; 0 means the passes cut straight from one to the next. */
  seconds: number;
  /** Distinguishes this layer's control from any other on screen. */
  layerId: string;
  disabled?: boolean;
  onChange: (seconds: number) => void;
}

export type { CrossfadeFieldProps };
