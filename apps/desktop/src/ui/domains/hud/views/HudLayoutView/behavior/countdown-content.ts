/* @layer renderer-hud @kind logic */
import type { CountdownTrack } from '@rotp/hud';
import type { HudCountdownVariant } from '../../../compounds/HudCountdown';
import type { CountdownContent } from '../HudLayoutView.type';

const countdownContentOf = (
  track: CountdownTrack, frames: number, variant: HudCountdownVariant,
): CountdownContent => ({
  countdown: { variant, total: track.total, remaining: track.remaining, fractionLeft: track.fractionLeft },
  source: { active: track.running, seconds: track.remaining, frames },
});

export { countdownContentOf };
