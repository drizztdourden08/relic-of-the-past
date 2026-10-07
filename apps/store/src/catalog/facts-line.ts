/* @layer store-site @kind logic */
/** What a version's manifest says, as one short line: "61 tracks · sounds included", "base en". */
import type { KindFacts } from '@shared/store/types';
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
