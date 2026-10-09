/* @layer store-site @kind logic */
import type { KindFacts } from '@rotp/hub-contracts';
import { plural } from '../lib/format-count';

const factsLine = (facts: KindFacts | null): string | null => {
  if (!facts) return null;
  switch (facts.kind) {
    case 'music': {
      const tracks = plural(facts.trackCount, 'track', 'tracks');
      return facts.soundCount > 0 ? `${tracks} · ${plural(facts.soundCount, 'sound', 'sounds')}` : tracks;
    }
    case 'character': return facts.author ? `drawn by ${facts.author}` : null;
    case 'language': return `base ${facts.base}`;
    default: return null;
  }
};

export { factsLine };
