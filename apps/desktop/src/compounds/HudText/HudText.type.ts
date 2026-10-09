/* @layer renderer-hud @kind types */
import type { HudTextFace, HudTextSpec } from '@rotp/hud';

interface HudTextProps {
  spec: HudTextSpec;
  scope: Readonly<Record<string, number>>;
  scale: number;
  spritesBase: string;
}

interface SpriteGlyphsProps {
  text: string;
  face: Extract<HudTextFace, { from: 'sprite' }>;
  scale: number;
  spritesBase: string;
}

interface FontTextProps {
  text: string;
  spec: HudTextSpec;
  face: Extract<HudTextFace, { from: 'font' }>;
  scope: Readonly<Record<string, number>>;
  scale: number;
}

export type { FontTextProps, HudTextProps, SpriteGlyphsProps };
