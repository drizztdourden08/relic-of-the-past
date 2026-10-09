/* @layer renderer-components @kind logic */
import type { SoundChannel } from '@shared/types/msu-manifest';
import { PORT_TAGS } from './effect-query.constants';
import type { EffectQuery } from './effect-query.type';

const parseEffectQuery = (filter: string): EffectQuery => {
  const words = filter.trim().split(/\s+/).filter((word) => word.length > 0);
  let channel: SoundChannel | null = null;
  const rest: string[] = [];

  for (const word of words) {
    const port = PORT_TAGS.find(([, tag]) => word.toLowerCase() === tag);
    if (port !== undefined) channel = port[0];
    else rest.push(word);
  }

  return { channel, text: rest.join(' ') };
};

export { parseEffectQuery };
