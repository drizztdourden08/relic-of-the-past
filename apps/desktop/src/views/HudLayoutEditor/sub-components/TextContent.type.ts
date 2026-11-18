/* @layer renderer-components @kind types */
import type { HudElementSpec, HudTextSpriteSet } from '@rotp/hud';
import type { Message } from '@drizztdourden08/brock-core/i18n';

type TextSpec = Extract<HudElementSpec, { type: 'text' }>;

interface TextContentProps {
  spec: TextSpec;
  onChange: (patch: Partial<TextSpec>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
}

interface SpriteSetOption { value: HudTextSpriteSet; label: Message; specimen: string; warn?: Message }

export type { SpriteSetOption, TextContentProps, TextSpec };
