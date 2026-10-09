/* @layer shared-asset-extraction @kind logic */
import { chromaOf, toOklab } from '../graphics/oklab';
import { snesToRgba } from '../graphics/palette';
import { NEUTRAL_CHROMA } from './perceptual-match';
import { SLOT_SIDE } from './fixed-row-tiles';
import {
  BLACK, LIGHTNESS_WEIGHT, MAJOR_GREY_SHARE, MEDOID_ROUNDS, PALETTE_COLORS, WHITE,
} from './foreign-icon-palette.constants';
import type { ImageBuffer } from '../graphics/png-writer';
import type { Oklab } from '../graphics/oklab';
import type { RGBA } from '../graphics/palette';
import type { ForeignIconPalette, PoolTone } from './foreign-icon-palette.type';

const toSnesWord = (c: RGBA): number =>
  Math.round((c[0] * 31) / 255) | (Math.round((c[1] * 31) / 255) << 5) | (Math.round((c[2] * 31) / 255) << 10);
const isNeutral = (lab: Oklab): boolean => chromaOf(lab) < NEUTRAL_CHROMA;
const distance = (a: Oklab, b: Oklab): number => (isNeutral(a) !== isNeutral(b)
  ? Number.POSITIVE_INFINITY
  : Math.hypot(LIGHTNESS_WEIGHT * (a[0] - b[0]), a[1] - b[1], a[2] - b[2]));

const poolTones = (pictures: readonly ImageBuffer[]): PoolTone[] => {
  const tones = new Map<number, PoolTone>();
  for (const picture of pictures) {
    const counts = new Map<number, number>();
    let opaque = 0;
    for (let i = 0; i < SLOT_SIDE * SLOT_SIDE; i++) {
      const color = picture.getPixel(i % SLOT_SIDE, Math.floor(i / SLOT_SIDE));
      if (color[3] === 0) continue;
      const key = (color[0] << 16) | (color[1] << 8) | color[2];
      counts.set(key, (counts.get(key) ?? 0) + 1);
      if (!tones.has(key)) tones.set(key, { key, color: [color[0], color[1], color[2], 255], lab: toOklab(color), count: 0, pictures: 0, share: 0 });
      opaque += 1;
    }
    for (const [key, count] of counts) {
      const tone = tones.get(key)!;
      tone.count += count;
      tone.pictures += 1;
      tone.share = Math.max(tone.share, count / opaque);
    }
  }
  return [...tones.values()].sort((a, b) => a.key - b.key);
};

const fixedEntries = (tones: readonly PoolTone[], pictureCount: number): RGBA[] => {
  const shared = tones.filter((tone) => tone.pictures === pictureCount);
  const majorGreys = tones
    .filter((tone) => !shared.includes(tone) && isNeutral(tone.lab) && tone.share >= MAJOR_GREY_SHARE)
    .sort((a, b) => b.count - a.count);
  return [BLACK, WHITE, ...shared.map((tone) => tone.color), ...majorGreys.map((tone) => tone.color)];
};

const nearest = (lab: Oklab, pool: readonly Oklab[]): number =>
  pool.reduce((best, entry, at) => (distance(lab, entry) < distance(lab, pool[best]) ? at : best), 0);

const medoidOf = (members: readonly PoolTone[]): PoolTone =>
  members.reduce((best, tone) => {
    const cost = (t: PoolTone): number => members.reduce((sum, m) => sum + m.count * distance(m.lab, t.lab), 0);
    return cost(tone) < cost(best) ? tone : best;
  });

const farthestFirstSeeds = (hues: readonly PoolTone[], fixed: readonly Oklab[], count: number): PoolTone[] => {
  const medoids: PoolTone[] = [];
  while (medoids.length < count) {
    const pool = [...fixed, ...medoids.map((m) => m.lab)];
    const cost = (t: PoolTone): number => (pool.length === 0 ? t.count : t.count * distance(t.lab, pool[nearest(t.lab, pool)]) ** 2);
    medoids.push(hues.filter((t) => !medoids.includes(t)).reduce((a, b) => (cost(b) > cost(a) ? b : a)));
  }
  return medoids;
};

const toneMedoids = (hues: readonly PoolTone[], fixed: readonly Oklab[], count: number): PoolTone[] => {
  if (hues.length <= count) return [...hues];
  const medoids = farthestFirstSeeds(hues, fixed, count);
  for (let round = 0; round < MEDOID_ROUNDS; round++) {
    const pool = [...fixed, ...medoids.map((m) => m.lab)];
    const next = medoids.map((medoid, at) => {
      const members = hues.filter((t) => nearest(t.lab, pool) === fixed.length + at);
      return members.length === 0 ? medoid : medoidOf(members);
    });
    if (next.every((m, at) => m === medoids[at])) break;
    medoids.splice(0, medoids.length, ...next);
  }
  return medoids;
};

const hueAngle = (lab: Oklab): number => Math.atan2(lab[2], lab[1]);

const buildForeignIconPalette = (pictures: readonly ImageBuffer[]): ForeignIconPalette => {
  const tones = poolTones(pictures);
  const fixed = fixedEntries(tones, pictures.length);
  const fixedKeys = new Set(fixed.map(toSnesWord));
  const rest = tones.filter((tone) => !fixedKeys.has(toSnesWord(tone.color)));
  const medoids = toneMedoids(rest, fixed.map(toOklab), Math.max(0, PALETTE_COLORS - fixedKeys.size));
  const words = [...new Set([...fixed, ...medoids.map((m) => m.color)].map(toSnesWord))].slice(0, PALETTE_COLORS);
  const entries = words.map((word) => ({ word, lab: toOklab(snesToRgba(word)) }));
  const greys = entries.filter((e) => isNeutral(e.lab)).sort((a, b) => a.lab[0] - b.lab[0]);
  const colours = entries.filter((e) => !isNeutral(e.lab)).sort((a, b) => hueAngle(a.lab) - hueAngle(b.lab));
  const ordered = [0, ...[...greys, ...colours].map((e) => e.word)];
  while (ordered.length < PALETTE_COLORS + 1) ordered.push(0);
  const row = ordered.map((word, at): RGBA => (at === 0 || at >= entries.length + 1 ? [0, 0, 0, 0] : snesToRgba(word)));
  return { words: ordered, row };
};

export { buildForeignIconPalette };
