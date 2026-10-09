/* @layer renderer-components @kind logic */
import type { PackSummaryLine } from '../../TrackList.type';

const plural = (count: number, word: string): string => `${count} ${word}${count === 1 ? '' : 's'}`;

const summaryText = (summary: PackSummaryLine): string => [
  plural(summary.tracks, 'track'),
  plural(summary.sounds, 'sound'),
  plural(summary.files, 'file'),
  ...(summary.deluxe ? ['deluxe'] : []),
].join(' · ');

export { summaryText };
