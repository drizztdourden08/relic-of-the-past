/* @layer renderer-hud @kind types */
import type { HudCountdownSpec } from '@shared/types/hud';
import type { HudCountdownContent } from '../../HudNodeRenderer.type';

interface HudNodeCountdownProps {
  spec: HudCountdownSpec;
  countdown: HudCountdownContent | undefined;
  scale: number;
  spritesBase: string;
}

export type { HudNodeCountdownProps };
