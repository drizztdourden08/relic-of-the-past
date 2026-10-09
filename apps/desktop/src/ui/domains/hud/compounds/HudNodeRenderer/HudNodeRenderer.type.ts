/* @layer renderer-hud @kind types */
import type { HeartMode } from '../../primitives/HudHeart';
import type { HudCountdownVariant } from '../HudCountdown';
import type { PlacedNode } from '@rotp/hud';
import type { SlotIndex } from '@rotp/game-data';
import type { GlyphSource } from '@rotp/input-mapping';
import type { HudElementSpec } from '@rotp/hud';

type HudGlyphSpec = Extract<HudElementSpec, { type: 'glyph' }>;

type HudSlotRole = 'item' | 'sword' | 'action' | 'none';

interface HudVitalsContent {
  healthCurrent: number;
  healthCapacity: number;
  heartMode: HeartMode;
  armor: number;
  magic: number;
  halfMagic: boolean;
  bombs: number;
  maxBombs: number;
  arrows: number;
  maxArrows: number;
  keys: number;
  hasSilverArrows: boolean;
  rupees: number;
  maxRupees: number;
  showMaxInYellow: boolean;
}

interface HudSlotContent {
  itemSprite: string | null;
  role: HudSlotRole;
  dimmed: boolean;
}

interface HudCountdownContent {
  variant: HudCountdownVariant;
  total: number;
  remaining: number;
  fractionLeft: number;
}

interface HudNodeContent {
  vitals: HudVitalsContent;
  slots: Readonly<Record<SlotIndex, HudSlotContent>>;
  glyph: (spec: HudGlyphSpec) => GlyphSource | null;
  countdown?: HudCountdownContent;
}

interface HudNodeRendererProps {
  nodes: readonly PlacedNode[];
  scale: number;
  content: HudNodeContent;
  spritesBase: string;
  origin?: { x: number; y: number };
  onSlotPress?: (slot: SlotIndex) => void;
  dataScope?: Readonly<Record<string, number>>;
  clockOverrideMs?: number | null;
}

interface DrawOrigin { x: number; y: number }

export type {
  DrawOrigin, HudCountdownContent, HudGlyphSpec, HudNodeContent, HudNodeRendererProps, HudSlotContent, HudSlotRole,
  HudVitalsContent,
};
