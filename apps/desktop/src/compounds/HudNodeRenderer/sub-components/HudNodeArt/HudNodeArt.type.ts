/* @layer renderer-hud @kind types */
import type { PlacedNode } from '@rotp/hud';
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

export type { GlyphArtProps, HudNodeArtProps };
