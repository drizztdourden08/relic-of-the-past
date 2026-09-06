/* @layer renderer-components @kind types */
interface LoopPointFieldProps {
  /** The layer's loop point in samples, or undefined when the manifest sets none. */
  loopSample: number | undefined;
  /** The file's own loop point in samples, shown when the manifest sets none. Null if the format cannot carry one or it is unread. */
  fileLoopSample: number | null;
  /** Namespaces the input id, so several layer cards on screen do not share one. */
  layerId: string;
  disabled?: boolean;
  onChange: (loopSample: number | undefined) => void;
}

export type { LoopPointFieldProps };
