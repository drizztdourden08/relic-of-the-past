/* @layer renderer-components @kind logic */
import type { SoundChannel } from '@shared/types/msu-manifest';
import { SOUND_CHANNEL_PORTS } from '@shared/game/data/game-sounds';
import { AMBIENT_BLURB } from './sound-subtitle.constants';
import type { SubtitleCounts } from './sound-subtitle.type';

const channelBlurb = (channel: SoundChannel): string => {
  if (channel === 'ambient') return AMBIENT_BLURB;
  return `One-shot effects on port ${SOUND_CHANNEL_PORTS[channel]}. Each trigger layers over whatever is`
    + ' still sounding. These ids are this port\'s own, so the same number on the other effects port is a'
    + ' different sound.';
};

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
export type { SubtitleCounts } from './sound-subtitle.type';
