/* @layer renderer-components @kind types */
import type { HudElementSpec, HudTextSpriteSet } from '@rotp/hud';

type TextSpec = Extract<HudElementSpec, { type: 'text' }>;

interface TextContentProps {
  spec: TextSpec;
  onChange: (patch: Partial<TextSpec>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
}

interface SpriteSetOption { value: HudTextSpriteSet; label: string; specimen: string; warn?: string }

export type { SpriteSetOption, TextContentProps, TextSpec };
