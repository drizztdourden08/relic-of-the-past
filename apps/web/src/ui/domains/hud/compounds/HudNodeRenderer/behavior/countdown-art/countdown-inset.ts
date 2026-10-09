/* @layer renderer-hud @kind logic */
import { COUNTDOWN_SIZE } from '@shared/hud/layouts';
import { countdownBox } from '../../../HudCountdown';
import type { HudCountdownVariant } from '../../../HudCountdown';

const countdownInset = (variant: HudCountdownVariant, scale: number): number =>
  (COUNTDOWN_SIZE.w * scale - countdownBox(variant, scale).size) / 2;

export { countdownInset };
