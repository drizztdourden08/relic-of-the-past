/* @layer renderer-components @kind types */
interface LoopPointFieldProps {
  /** The layer's loop point in samples, or undefined when the manifest sets none. */
  loopSample: number | undefined;
  /**
   * What the file itself declares, in samples. Used when the manifest sets nothing, so the control
   * opens on the value actually in force rather than on zero. Null for a format that cannot carry
   * one, or before it has been read.
   */
  fileLoopSample: number | null;
  /** Namespaces the input id, so several layer cards on screen do not share one. */
  layerId: string;
  disabled?: boolean;
  onChange: (loopSample: number | undefined) => void;
}

export type { LoopPointFieldProps };
