/* @layer renderer-components @kind util */
/**
 * The sentence under a sound channel's title, which has to stay true as the list changes.
 *
 * The effects channels list their whole range, so the honest thing to say is how much of it the
 * game is known to raise. The ambient channel lists only what the game can reach, so what needs
 * saying is how much is being kept out of the way — and that number changes the moment the
 * unreachable ids are shown.
 *
 * The two effects channels share one tab, so their opening lines must not read as the same
 * sentence twice: each names its own port and says outright that the ids below belong to that
 * port alone. Two identical blurbs over two lists of the same ids is how someone replaces 0x12
 * on the wrong channel.
 */
import type { SoundChannel } from '@shared/types/msu-manifest';
import { SOUND_CHANNEL_PORTS } from '@shared/game/data/game-sounds';

const AMBIENT_BLURB =
  'The looping beds. A new one replaces the last, and its position is remembered across a save.';

const channelBlurb = (channel: SoundChannel): string => {
  if (channel === 'ambient') return AMBIENT_BLURB;
  return `One-shot effects on port ${SOUND_CHANNEL_PORTS[channel]}. Each trigger layers over whatever is`
    + ' still sounding. These ids are this port\'s own — the same number on the other effects port is a'
    + ' different sound.';
};

interface SubtitleCounts {
  channel: SoundChannel;
  /** How many rows the tab is offering. */
  total: number;
  /** Of those, how many the generated catalogue has a call site for. */
  raisedCount: number;
  /** Of those, how many the game can actually reach — ambient only. */
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
