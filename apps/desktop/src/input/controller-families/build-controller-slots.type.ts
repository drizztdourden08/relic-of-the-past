/* @layer renderer-lib @kind types */
import type { ReactNode } from 'react';
import type { ControllerExtra, ControllerSlots } from '@drizztdourden08/tessera/composites';

interface ControllerSlotSet {
  slots: ControllerSlots;
  extras: ControllerExtra[];
}

type GlyphOf = (iconId: string) => ReactNode;

export type { ControllerSlotSet, GlyphOf };
