/* @layer renderer-components @kind types */
interface LoopPointFieldProps {
  loopSample: number | undefined;
  fileLoopSample: number | null;
  layerId: string;
  disabled?: boolean;
  onChange: (loopSample: number | undefined) => void;
}

export type { LoopPointFieldProps };
