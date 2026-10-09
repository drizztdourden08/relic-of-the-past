/* @layer renderer-components @kind types */
import type { HudContainer } from '@shared/types/hud';

interface FlexSlot {
  id: string;
  w: number;
  h: number;
}

type FlexSlotLookup = (container: HudContainer) => readonly FlexSlot[];

export type { FlexSlot, FlexSlotLookup };
