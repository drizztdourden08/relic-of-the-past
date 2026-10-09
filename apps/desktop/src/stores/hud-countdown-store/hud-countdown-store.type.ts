/* @layer renderer-stores @kind types */
import type { CountdownReading, CountdownTrack } from '@rotp/hud';

interface HudCountdownStore {
  track: CountdownTrack;
  advance: (reading: CountdownReading) => void;
}

export type { HudCountdownStore };
