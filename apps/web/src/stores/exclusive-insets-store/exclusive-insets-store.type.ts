/* @layer renderer-stores @kind types */
import type { ExclusiveInsets } from '@drizztdourden08/tessera/composites';

interface ExclusiveInsetsState {
  insets: ExclusiveInsets;
  setInsets: (insets: ExclusiveInsets) => void;
}

export type { ExclusiveInsetsState };
