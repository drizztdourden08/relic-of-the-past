/* @layer shared-asset-extraction @kind logic */
/**
 * Which entry of a fixed sprite palette row each colour of a picture becomes, judged by how
 * the colours look (OKLab), for pictures drawn with colours the row does not hold.
 *
 * - A grey only ever becomes one of the row's greys (black, dark grey, white), matched by
 *   lightness. When several of the picture's greys land on one entry and the next darker
 *   grey entry is unused by the picture, the darkest of them moves down to it, so a picture
 *   drawn in three greys keeps an outline against its body.
 * - A colour only ever becomes one of the row's colours, matched by OKLab distance with
 *   lightness at half weight, so the hue decides first. When two areas of the picture land
 *   on one entry, the one closest to it in lightness keeps it and the other moves to the
 *   nearest close entry on its own side in lightness, so two shades of one hue (a gold
 *   shield and its pale cross) stay apart instead of merging. A speck of a few pixels
 *   always shares its nearest entry.
 *
 * An equal colour held twice in the row resolves to its lowest index.
 */
import { chromaOf, toOklab } from '../graphics/oklab';
import type { Oklab } from '../graphics/oklab';
import type { RGBA } from '../graphics/palette';

/** Below this OKLab chroma a colour reads as grey (the pool art's warm outline is 0.002). */
const NEUTRAL_CHROMA = 0.04;
/** Lightness weight for a coloured match: under 1 so a hue beats a shade of another hue. */
const LIGHTNESS_WEIGHT = 0.5;
/** The farthest a colour may move to stay apart from a more common one sharing its entry. */
const SPREAD_LIMIT = 0.12;
/** A tone this small (the badge's specks) never takes or loses an entry: it shares the nearest. */
const SPECK_PIXELS = 4;

interface Entry { index: number; lab: Oklab }
interface Entries { neutral: Entry[]; chromatic: Entry[] }
/** One distinct colour of a picture and how many pixels use it. */
interface Tone { key: number; lab: Oklab; count: number }

const colorKey = (c: RGBA): number => (c[0] << 16) | (c[1] << 8) | c[2];
const isNeutral = (lab: Oklab): boolean => chromaOf(lab) < NEUTRAL_CHROMA;

/** The row's opaque colours 1-15, one entry per distinct colour, greys sorted dark to light. */
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

/** Each grey tone to a position in the sorted greys. */
const placeGreys = (greys: readonly Tone[], neutral: readonly Entry[]): Map<number, number> => {
  const placed = new Map<number, number>();
  for (const tone of greys) {
    let best = 0;
    neutral.forEach((e, at) => { if (Math.abs(e.lab[0] - tone.lab[0]) < Math.abs(neutral[best].lab[0] - tone.lab[0])) best = at; });
    placed.set(tone.key, best);
  }
  for (let at = 1; at < neutral.length; at++) {
    const here = greys.filter((tone) => placed.get(tone.key) === at);
    if (here.length < 2 || [...placed.values()].includes(at - 1)) continue;
    placed.set(here.reduce((a, b) => (a.lab[0] <= b.lab[0] ? a : b)).key, at - 1);
  }
  return new Map([...placed].map(([key, at]) => [key, neutral[at].index]));
};

const nearestEntry = (lab: Oklab, pool: readonly Entry[]): Entry | undefined =>
  pool.reduce<Entry | undefined>((best, e) => (best === undefined || hueDistance(lab, e.lab) < hueDistance(lab, best.lab) ? e : best), undefined);

/**
 * Where a tone that lost its entry goes: the nearest other entry within SPREAD_LIMIT that
 * sits on the tone's own side in lightness (a darker shade to a darker entry), else stays.
 */
const spreadEntry = (tone: Tone, keeper: Tone, shared: Entry, pool: readonly Entry[]): Entry => {
  const side = Math.sign(tone.lab[0] - keeper.lab[0]);
  const options = pool.filter((e) => e !== shared && Math.sign(e.lab[0] - shared.lab[0]) === side
    && hueDistance(tone.lab, e.lab) <= SPREAD_LIMIT);
  return nearestEntry(tone.lab, options) ?? shared;
};

/**
 * Each coloured tone to its nearest entry; where several share one, the tone closest to it
 * in lightness keeps it and the others spread (spreadEntry).
 */
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

/** Every tone (by colour key) to its row index; a tone with no entry at all is left out. */
const matchTones = (tones: readonly Tone[], row: readonly RGBA[]): Map<number, number> => {
  const entries = rowEntries(row);
  const hasGreys = entries.neutral.length > 0;
  const greys = tones.filter((tone) => hasGreys && isNeutral(tone.lab));
  const hues = tones.filter((tone) => !greys.includes(tone));
  const huePool = entries.chromatic.length > 0 ? entries.chromatic : entries.neutral;
  return new Map([...placeGreys(greys, entries.neutral), ...placeHues(hues, huePool)]);
};

export { colorKey, matchTones, NEUTRAL_CHROMA };
export type { Tone };
