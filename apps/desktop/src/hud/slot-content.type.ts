/* @layer renderer-lib @kind types */
import type { DeviceFamily } from '@rotp/game-data';
import type { GlyphPack, GlyphSource } from '@rotp/input-mapping';
import type { HudGlyphSpec, HudSlotContent } from '@app/compounds/HudNodeRenderer';
import type { ModernSlot, SlotAssignment, SlotIndex } from '@rotp/game-data';

interface SlotContentInput {
  slots: readonly ModernSlot[];
  assignments: Readonly<Record<SlotIndex, SlotAssignment>>;
  items: readonly number[];
  bottles: readonly number[];
  swordTier: number;
  packId: string;
  packs: readonly GlyphPack[];
  family: DeviceFamily;
}

interface SlotContent {
  slots: Record<SlotIndex, HudSlotContent>;
  filledSlots: number[];
  glyph: (spec: HudGlyphSpec) => GlyphSource | null;
  signature: string;
}

export type { SlotContent, SlotContentInput };
