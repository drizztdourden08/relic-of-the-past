/* @layer shared-game @kind logic */
import type { MarkArt } from '../latin-letters.type';
import { PAIR_GAP } from './compose.constants';

const pairRows = (host: readonly string[], tone: readonly string[]): string[] => {
  const height = Math.max(host.length, tone.length);
  const hostWidth = Math.max(...host.map((row) => row.length));
  const rows: string[] = [];
  for (let i = 0; i < height; i++) {
    const left = host[i - (height - host.length)] ?? '';
    const right = tone[i - (height - tone.length)] ?? '';
    rows.push(left.padEnd(hostWidth + PAIR_GAP) + right);
  }
  return rows;
};

const pairArt = (host: MarkArt, tone: MarkArt): MarkArt => ({
  place: 'above',
  rows: pairRows(host.rows, tone.rows),
  compact: pairRows(host.compact ?? host.rows, tone.compact ?? tone.rows),
});

export { pairArt };
