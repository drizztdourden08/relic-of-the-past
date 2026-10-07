/* @layer renderer-hud @kind logic */
/**
 * The tracked countdown, split into what a `countdown` node draws and what the
 * data scope reads (§62). Pure, so the live path from a parsed reading to a
 * placed node is testable with no store and no DOM.
 */
import type { HudCountdownSource } from '@shared/hud/data';
import type { CountdownTrack } from '@app/lib/game/hud-countdown-track';
import type { HudCountdownContent } from '../../../compounds/HudNodeRenderer';
import type { HudCountdownVariant } from '../../../compounds/HudCountdown';

interface CountdownContent {
  /** What a `countdown` node draws. */
  countdown: HudCountdownContent;
  /** What `countdown_active` / `countdown_seconds` / `countdown_frames` read. */
  source: HudCountdownSource;
}

/** `frames` is the game's own frames-left-in-this-second, which the track
 *  does not keep; the seconds are the track's, so the scope and the pie agree. */
const countdownContentOf = (
  track: CountdownTrack, frames: number, variant: HudCountdownVariant,
): CountdownContent => ({
  countdown: { variant, total: track.total, remaining: track.remaining, fractionLeft: track.fractionLeft },
  source: { active: track.running, seconds: track.remaining, frames },
});

export { countdownContentOf };
export type { CountdownContent };
