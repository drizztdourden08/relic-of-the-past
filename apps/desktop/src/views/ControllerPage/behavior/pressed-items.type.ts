/* @layer renderer-components @kind types */
import type { PressedGridItem } from '@drizztdourden08/brock-input/renderer';

interface PressedModel {
  items: readonly PressedGridItem[];
  pressed: readonly string[];
}

export type { PressedModel };
