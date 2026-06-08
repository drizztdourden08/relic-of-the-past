/* @layer renderer-components @kind types */
interface ProgressRingProps {
  /** Fill fraction 0..1. Omit to render only the track ring. */
  progress?: number;
  /** Circle radius within the 36-unit viewBox (default 15). */
  radius?: number;
  /** Stroke thickness (default 2.5). */
  strokeWidth?: number;
  className?: string;
}

export type { ProgressRingProps };
