/* @layer renderer-components @kind logic */
/**
 * Splits the effects search into "which port" and "what to look for".
 *
 * Only worth doing once both ports share one list. The port is the one thing a merged list can be
 * asked about that neither channel could answer on its own — typing `sfx2` has to mean "just that
 * port", but no id, name or trigger contains that text, so passing it through as a plain query
 * would match nothing on either channel and empty the list.
 *
 * The port token is taken from anywhere in the query and the rest is left alone, so `sfx2 bomb`
 * narrows twice and word order does not matter.
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
    // A second port named after a first is a contradiction, not a widening — the later one wins,
    // which is what re-typing it to change your mind does.
    if (port !== undefined) channel = port[0];
    else rest.push(word);
  }

  return { channel, text: rest.join(' ') };
};

export { parseEffectQuery };
export type { EffectQuery };
