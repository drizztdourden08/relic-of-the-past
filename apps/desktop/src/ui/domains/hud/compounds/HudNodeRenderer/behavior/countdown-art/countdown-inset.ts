/* @layer renderer-hud @kind logic */
import { COUNTDOWN_SIZE } from '@rotp/hud';
import { countdownBox } from '../../../HudCountdown';
import type { HudCountdownVariant } from '../../../HudCountdown';

const countdownInset = (variant: HudCountdownVariant, scale: number): number =>
  (COUNTDOWN_SIZE.w * scale - countdownBox(variant, scale).size) / 2;

export { countdownInset };
