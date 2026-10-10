/* @layer renderer-components @kind types */
import type { HudElementSpec } from '@rotp/hud';

interface SpriteContentProps {
  spec: Extract<HudElementSpec, { type: 'sprite' }>;
  onChange: (patch: Partial<Extract<HudElementSpec, { type: 'sprite' }>>) => void;
}

export type { SpriteContentProps };
