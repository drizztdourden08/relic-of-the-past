/* @layer renderer-components @kind types */
import type { useOptimize } from '../../../behavior/useOptimize';

type OptimizeActionsProps = Pick<ReturnType<typeof useOptimize>, 'step' | 'convertibleCount' | 'convert' | 'retry'> & {
  onClose: () => void;
};

export type { OptimizeActionsProps };
