/* @layer renderer-hud @kind logic */
import type { HudCountdownVariantChoice } from '@shared/types/hud';
import type { HudCountdownVariant } from '../../../HudCountdown';

const countdownVariantOf = (
  choice: HudCountdownVariantChoice | undefined, setting: HudCountdownVariant,
): HudCountdownVariant => (choice === undefined || choice === 'setting' ? setting : choice);

export { countdownVariantOf };
