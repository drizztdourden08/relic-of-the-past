/* @layer renderer-components @kind util */
/**
 * The sentence under a sound channel's title. Effects channels say how much of the range the game
 * raises; the ambient channel says how much is hidden. Each effects port names itself so two
 * lists of the same ids do not read as one.
 */
import type { SoundChannel } from '@shared/types/msu-manifest';
import { SOUND_CHANNEL_PORTS } from '@shared/game/data/game-sounds';

const AMBIENT_BLURB =
  'The looping beds. A new one replaces the last, and its position is remembered across a save.';

const channelBlurb = (channel: SoundChannel): string => {
  if (channel === 'ambient') return AMBIENT_BLURB;
  return `One-shot effects on port ${SOUND_CHANNEL_PORTS[channel]}. Each trigger layers over whatever is`
    + ' still sounding. These ids are this port\'s own, so the same number on the other effects port is a'
    + ' different sound.';
};

interface SubtitleCounts {
  channel: SoundChannel;
  /** How many rows the tab is offering. */
  total: number;
  /** Of those, how many the generated catalogue has a call site for. */
  raisedCount: number;
  /** Of those, how many the game can actually reach. Ambient only. */
  reachableCount: number;
  /** How many rows the reachable trim is holding back. */
  hiddenCount: number;
  showUnreachable: boolean;
}

const reachSentence = (counts: SubtitleCounts): string => {
  const { total, raisedCount, reachableCount, hiddenCount, showUnreachable } = counts;
  if (counts.channel !== 'ambient') {
    return `${raisedCount} of the ${total} ids are ones the game asks for; the rest the channel can still carry.`;
  }
  const tail = showUnreachable
    ? 'the rest the channel can carry, but nothing in the game raises them.'
    : `${hiddenCount} more the channel could carry are hidden.`;
  return `${reachableCount} of the ${total} listed ids are ones the game can reach; ${tail}`;
};

const soundPanelSubtitle = (counts: SubtitleCounts): string =>
  `${channelBlurb(counts.channel)} ${reachSentence(counts)}`;

export { soundPanelSubtitle };
export type { SubtitleCounts };
