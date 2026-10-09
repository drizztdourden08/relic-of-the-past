/* @layer renderer-components @kind types */
import type { HudElementSpec } from '@shared/types/hud';

interface SpriteContentProps {
  spec: Extract<HudElementSpec, { type: 'sprite' }>;
  onChange: (patch: Partial<Extract<HudElementSpec, { type: 'sprite' }>>) => void;
}

export type { SpriteContentProps };
