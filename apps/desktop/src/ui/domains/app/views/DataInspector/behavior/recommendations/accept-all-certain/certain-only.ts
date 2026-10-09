/* @layer renderer-app @kind logic */
import type { Recommendation } from '@rotp/navigation';

const certainOnly = (entries: readonly Recommendation[]): readonly Recommendation[] =>
  entries.filter(entry => entry.confidence === 'certain' && entry.state === 'open');

export { certainOnly };
