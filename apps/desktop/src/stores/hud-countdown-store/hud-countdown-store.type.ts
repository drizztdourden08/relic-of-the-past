/* @layer renderer-stores @kind types */
import type { CountdownReading, CountdownTrack } from '../../lib/game/hud-countdown-track';

interface HudCountdownStore {
  track: CountdownTrack;
  advance: (reading: CountdownReading) => void;
}

export type { HudCountdownStore };
