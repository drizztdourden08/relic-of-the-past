/* @layer renderer-components @kind types */
import type { HudNodeContent } from '@domains/hud/compounds/HudNodeRenderer';
import type { ModernSlot } from '@shared/types/controls/scheme';
import type { Size } from '@shared/hud/layouts';

interface EditorSampleState {
  /** False when nothing is running and the values below are made up. */
  live: boolean;
  /** The slot list the preview is drawn for, from the pad in hand or the sample. */
  slots: readonly ModernSlot[];
  content: HudNodeContent;
  /** Slot numbers that fire something, for the layout pass's dim rule. */
  filledSlots: number[];
  /** Heart containers, for the layout pass. The life block grows a row per ten. */
  hearts: number;
  /** The data surface every bound `Value`/`repeat`/`switch` in the preview
   *  reads from. It is built from the same `content.vitals` above. */
  dataScope: Readonly<Record<string, number>>;
  view: Size;
  spritesBase: string;
}

export type { EditorSampleState };
