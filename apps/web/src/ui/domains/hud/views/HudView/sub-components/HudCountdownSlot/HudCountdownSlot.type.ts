/* @layer renderer-hud @kind types */
import type { HudCountdownVariant } from '../../../../compounds/HudCountdown';

interface HudCountdownSlotProps {
  variant: HudCountdownVariant;
  scale: number;
  spritesBase: string;
}

export type { HudCountdownSlotProps };
