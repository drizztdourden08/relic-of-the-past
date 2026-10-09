/* @layer renderer-stores @kind types */
import type { ExclusiveInsets } from '@ds/composites/Widget';

interface ExclusiveInsetsState {
  insets: ExclusiveInsets;
  setInsets: (insets: ExclusiveInsets) => void;
}

export type { ExclusiveInsetsState };
