/* @layer renderer-components @kind logic */
/**
 * How the two things the studio can audition are named in the live report.
 *
 * The report store holds one key at a time and every readout compares against it, so the two
 * spaces have to be impossible to confuse: slot 5 and sound 5 are different auditions, and a
 * bare number would have made them the same one.
 */
import type { SoundChannel } from '@shared/types/msu-manifest';

const trackPreviewKey = (trackNum: number): string => `track:${trackNum}`;

const soundPreviewKey = (channel: SoundChannel, soundId: number): string =>
  `sound:${channel}:${soundId}`;

export { trackPreviewKey, soundPreviewKey };
