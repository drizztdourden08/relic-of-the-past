/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import { chromaOf, toOklab } from '../../graphics/oklab';
import { colorKey } from './color-key';
import { LIGHTNESS_WEIGHT, NEUTRAL_CHROMA, SPECK_PIXELS, SPREAD_LIMIT } from './perceptual-match.constants';
import type { Oklab } from '../../graphics/oklab';
import type { RGBA } from '../../graphics/palette';
import type { Entries, Entry, Tone } from './perceptual-match.type';

const isNeutral = (lab: Oklab): boolean => chromaOf(lab) < NEUTRAL_CHROMA;

const rowEntries = (row: readonly RGBA[]): Entries => {
  const seen = new Set<number>();
  const entries: Entries = { neutral: [], chromatic: [] };
  for (let index = 1; index < 16; index++) {
    const color = row[index];
    if (color === undefined || color[3] === 0 || seen.has(colorKey(color))) continue;
    seen.add(colorKey(color));
    const lab = toOklab(color);
    (isNeutral(lab) ? entries.neutral : entries.chromatic).push({ index, lab });
  }
  entries.neutral.sort((a, b) => a.lab[0] - b.lab[0]);
  return entries;
};

const hueDistance = (a: Oklab, b: Oklab): number =>
  Math.hypot(LIGHTNESS_WEIGHT * (a[0] - b[0]), a[1] - b[1], a[2] - b[2]);

const placeGreys = (greys: readonly Tone[], neutral: readonly Entry[]): Map<number, number> => {
  const placed = new Map<number, number>();
  for (const tone of greys) {
    let best = 0;
    neutral.forEach((e, at) => { if (Math.abs(e.lab[0] - tone.lab[0]) < Math.abs(itemAt(neutral, best, 'Neutral palette entry').lab[0] - tone.lab[0])) best = at; });
    placed.set(tone.key, best);
  }
  for (let at = 1; at < neutral.length; at++) {
    const here = greys.filter((tone) => placed.get(tone.key) === at);
    if (here.length < 2 || [...placed.values()].includes(at - 1)) continue;
    placed.set(here.reduce((a, b) => (a.lab[0] <= b.lab[0] ? a : b)).key, at - 1);
  }
  return new Map([...placed].map(([key, at]) => [key, itemAt(neutral, at, 'Neutral palette entry').index]));
};

const nearestEntry = (lab: Oklab, pool: readonly Entry[]): Entry | undefined =>
  pool.reduce<Entry | undefined>((best, e) => (best === undefined || hueDistance(lab, e.lab) < hueDistance(lab, best.lab) ? e : best), undefined);

const spreadEntry = (tone: Tone, keeper: Tone, shared: Entry, pool: readonly Entry[]): Entry => {
  const side = Math.sign(tone.lab[0] - keeper.lab[0]);
  const options = pool.filter((e) => e !== shared && Math.sign(e.lab[0] - shared.lab[0]) === side
    && hueDistance(tone.lab, e.lab) <= SPREAD_LIMIT);
  return nearestEntry(tone.lab, options) ?? shared;
};

const placeHues = (hues: readonly Tone[], pool: readonly Entry[]): Map<number, number> => {
  const byEntry = new Map<Entry, Tone[]>();
  for (const tone of hues) {
    const entry = nearestEntry(tone.lab, pool);
    if (entry !== undefined) byEntry.set(entry, [...(byEntry.get(entry) ?? []), tone]);
  }
  const placed = new Map<number, number>();
  for (const [entry, tones] of byEntry) {
    const areas = tones.filter((tone) => tone.count > SPECK_PIXELS);
    const keeper = areas.reduce<Tone | undefined>((a, b) =>
      (a !== undefined && Math.abs(a.lab[0] - entry.lab[0]) <= Math.abs(b.lab[0] - entry.lab[0]) ? a : b), undefined);
    for (const tone of tones) {
      const moves = keeper !== undefined && tone !== keeper && areas.includes(tone);
      placed.set(tone.key, (moves ? spreadEntry(tone, keeper, entry, pool) : entry).index);
    }
  }
  return placed;
};

const matchTones = (tones: readonly Tone[], row: readonly RGBA[]): Map<number, number> => {
  const entries = rowEntries(row);
  const hasGreys = entries.neutral.length > 0;
  const greys = tones.filter((tone) => hasGreys && isNeutral(tone.lab));
  const hues = tones.filter((tone) => !greys.includes(tone));
  const huePool = entries.chromatic.length > 0 ? entries.chromatic : entries.neutral;
  return new Map([...placeGreys(greys, entries.neutral), ...placeHues(hues, huePool)]);
};

export { matchTones };
