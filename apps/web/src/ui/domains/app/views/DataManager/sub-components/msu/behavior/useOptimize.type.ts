/* @layer renderer-components @kind types */
type OptimizeStep = 'checking' | 'tool' | 'measuring' | 'preview' | 'converting' | 'result' | 'error';

interface OptimizeParams {
  pack: string;
  open: boolean;
  onRunSettled: () => void;
}

export type { OptimizeParams, OptimizeStep };
