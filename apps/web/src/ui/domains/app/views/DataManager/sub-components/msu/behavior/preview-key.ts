/* @layer renderer-components @kind logic */
// Keys for the live report. Slot 5 and sound 5 are different auditions, so a bare number will not do.
import type { SoundChannel } from '@shared/types/msu-manifest';

const trackPreviewKey = (trackNum: number): string => `track:${trackNum}`;

const soundPreviewKey = (channel: SoundChannel, soundId: number): string =>
  `sound:${channel}:${soundId}`;

export { trackPreviewKey, soundPreviewKey };
