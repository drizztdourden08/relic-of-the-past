/* @layer renderer-components @kind types */
import type { useOptimize } from '../../../behavior/useOptimize';

type OptimizeBodyProps = Pick<
  ReturnType<typeof useOptimize>,
  'step' | 'tool' | 'analysis' | 'progress' | 'result' | 'error' | 'convertibleCount'
>;

export type { OptimizeBodyProps };
