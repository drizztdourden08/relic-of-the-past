/* @layer renderer-hud @kind types */
import type { HudElementSpec, PlacedNode } from '@rotp/hud';
import type { HudGlyphSpec, HudNodeContent } from '../../HudNodeRenderer.type';

interface HudNodeArtProps {
  placed: PlacedNode;
  scale: number;
  content: HudNodeContent;
  spritesBase: string;
  dataScope: Readonly<Record<string, number>>;
}

interface GlyphArtProps {
  spec: HudGlyphSpec;
  content: HudNodeContent;
  dimmed: boolean;
  scale: number;
}

interface SlotArtProps {
  spec: Extract<HudElementSpec, { type: 'slot' }>;
  content: HudNodeContent;
  dimmed: boolean;
  tile: number;
  scale: number;
  spritesBase: string;
}

interface SpriteArtProps {
  spec: Extract<HudElementSpec, { type: 'sprite' }>;
  rect: PlacedNode['rect'];
  displayScale: number;
  scale: number;
  spritesBase: string;
}

export type { GlyphArtProps, HudNodeArtProps, SlotArtProps, SpriteArtProps };
