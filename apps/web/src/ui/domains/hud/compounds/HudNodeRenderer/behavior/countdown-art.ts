/* @layer renderer-hud @kind logic */
/**
 * Which pie a `countdown` node draws, and how far it sits in from its box.
 *
 * THE BOX IS THE PIXEL PIE'S (`COUNTDOWN_SIZE`, 44 game px). The smooth pie is a
 * hair wider, about 44.4, around the same disc. `HudView` centres the pie across
 * the frame and pins the DISC's bottom edge, so the smooth one is centred across
 * this box here and keeps its top edge: its rim then ends exactly where the pixel
 * pie's does, and both discs share a centre and a bottom line.
 */
import { COUNTDOWN_SIZE } from '@shared/hud/layouts';
import { countdownBox } from '../../HudCountdown';
import type { HudCountdownVariant } from '../../HudCountdown';
import type { HudCountdownVariantChoice } from '@shared/types/hud';

/** The node's own pie when it names one, else the profile's. */
const countdownVariantOf = (
  choice: HudCountdownVariantChoice | undefined, setting: HudCountdownVariant,
): HudCountdownVariant => (choice === undefined || choice === 'setting' ? setting : choice);

/** CSS px the pie is moved right by to centre it across its box. 0 for the pixel pie. */
const countdownInset = (variant: HudCountdownVariant, scale: number): number =>
  (COUNTDOWN_SIZE.w * scale - countdownBox(variant, scale).size) / 2;

export { countdownInset, countdownVariantOf };
