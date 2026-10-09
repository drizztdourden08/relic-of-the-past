/* @layer renderer-components @kind types */
import type { HudNodeContent } from '@domains/hud/compounds/HudNodeRenderer';
import type { ModernSlot } from '@rotp/game-data';
import type { GlyphPack } from '@rotp/input-mapping';
import type { Size } from '@rotp/hud';

interface EditorSampleState {
  live: boolean;
  slots: readonly ModernSlot[];
  content: HudNodeContent;
  filledSlots: number[];
  hearts: number;
  dataScope: Readonly<Record<string, number>>;
  view: Size;
  spritesBase: string;
}

interface SampleStateArgs {
  packId: string;
  packs: readonly GlyphPack[];
  slots: readonly ModernSlot[];
  view: Size;
}

export type { EditorSampleState, SampleStateArgs };
