/* @layer renderer-app @kind logic */
import type { Recommendation } from '@shared/game/recommendations';

const certainOnly = (entries: readonly Recommendation[]): readonly Recommendation[] =>
  entries.filter(entry => entry.confidence === 'certain' && entry.state === 'open');

export { certainOnly };
