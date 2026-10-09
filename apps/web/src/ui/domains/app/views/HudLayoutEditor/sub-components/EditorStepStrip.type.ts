/* @layer renderer-components @kind types */
interface EditorStepStripProps {
  step: number;
  onStepChange: (next: number) => void;
}

export type { EditorStepStripProps };
