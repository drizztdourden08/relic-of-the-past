/* @layer renderer-hud @kind types */
import type { HudCountdownVariant } from '../../../../compounds/HudCountdown';

interface HudCountdownSlotProps {
  /** Which pie is drawn, from the HUD settings. */
  variant: HudCountdownVariant;
  /** CSS pixels per game pixel, as HudView measured it. */
  scale: number;
  spritesBase: string;
}

export type { HudCountdownSlotProps };
