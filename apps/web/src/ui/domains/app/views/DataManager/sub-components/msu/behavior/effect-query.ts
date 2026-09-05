/* @layer renderer-components @kind logic */
/**
 * Splits the effects search into "which port" and "what to look for". `sfx2` must mean the port;
 * as plain text it matches nothing and empties the list. The token can sit anywhere in the query.
 */
import type { SoundChannel } from '@shared/types/msu-manifest';
import { SOUND_CHANNEL_TAGS } from '../sound-labels';

interface EffectQuery {
  /** The port asked for, or null when the query names none and both are in play. */
  channel: SoundChannel | null;
  /** What is left to match ids, names and triggers against. */
  text: string;
}

const PORT_TAGS: [SoundChannel, string][] = [
  ['sfx1', SOUND_CHANNEL_TAGS.sfx1.toLowerCase()],
  ['sfx2', SOUND_CHANNEL_TAGS.sfx2.toLowerCase()],
];

const parseEffectQuery = (filter: string): EffectQuery => {
  const words = filter.trim().split(/\s+/).filter((word) => word.length > 0);
  let channel: SoundChannel | null = null;
  const rest: string[] = [];

  for (const word of words) {
    const port = PORT_TAGS.find(([, tag]) => word.toLowerCase() === tag);
    // A second port named after a first is a contradiction, not a widening: the later one wins.
    if (port !== undefined) channel = port[0];
    else rest.push(word);
  }

  return { channel, text: rest.join(' ') };
};

export { parseEffectQuery };
export type { EffectQuery };
