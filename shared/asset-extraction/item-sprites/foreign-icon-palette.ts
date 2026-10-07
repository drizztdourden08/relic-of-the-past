/* @layer shared-asset-extraction @kind logic */
/**
 * The multiworld pool icons' own 15 colours, picked from the icons' pixels. The core shows
 * the icons against a private palette bank of these colours (foreign_icon_bank.c), so no
 * sprite row of the game has to fit pictures drawn for other games.
 *
 * - The neutral axis: black, white, every tone all the icons share (the outline, and the
 *   Archipelago badge's colours with it, so the badge reads the same on every icon), and
 *   every grey that covers at least an eighth of one icon (the fused shadow's two greys).
 * - The remaining entries go to the other colours by a weighted k-medoids over the tones,
 *   measured in OKLab with lightness at half weight as the matcher measures them
 *   (perceptual-match.ts). A medoid is a real tone of the art, so every entry is a colour
 *   one of the icons actually uses.
 * - Every entry is snapped to SNES 15-bit colour, the form the core stores.
 *
 * Index 0 is transparent; entries run greys dark to light, then colours by hue.
 */
import { chromaOf, toOklab } from '../graphics/oklab';
import { snesToRgba } from '../graphics/palette';
import { NEUTRAL_CHROMA } from './perceptual-match';
import { SLOT_SIDE } from './fixed-row-tiles';
import type { ImageBuffer } from '../graphics/png-writer';
import type { Oklab } from '../graphics/oklab';
import type { RGBA } from '../graphics/palette';

/** Opaque entries in the bank: a sprite palette row less its transparent index. */
const PALETTE_COLORS = 15;
/** A grey covering this share of one icon's opaque pixels keeps an entry of its own. */
const MAJOR_GREY_SHARE = 1 / 8;
/** Lightness weight between colours, as the matcher uses: the hue decides first. */
const LIGHTNESS_WEIGHT = 0.5;
const MEDOID_ROUNDS = 32;
const BLACK: RGBA = [0, 0, 0, 255];
const WHITE: RGBA = [255, 255, 255, 255];

interface PoolTone { key: number; color: RGBA; lab: Oklab; count: number; pictures: number; share: number }

interface ForeignIconPalette {
  /** 16 SNES words, [0] = 0 (transparent). */
  words: number[];
  /** The same 16 entries as colours, [0] transparent: the row the matcher quantizes to. */
  row: RGBA[];
}

const toSnesWord = (c: RGBA): number =>
  Math.round((c[0] * 31) / 255) | (Math.round((c[1] * 31) / 255) << 5) | (Math.round((c[2] * 31) / 255) << 10);
const isNeutral = (lab: Oklab): boolean => chromaOf(lab) < NEUTRAL_CHROMA;
/** A grey and a colour never serve each other, as in the matcher, so they are infinitely apart. */
const distance = (a: Oklab, b: Oklab): number => (isNeutral(a) !== isNeutral(b)
  ? Number.POSITIVE_INFINITY
  : Math.hypot(LIGHTNESS_WEIGHT * (a[0] - b[0]), a[1] - b[1], a[2] - b[2]));

/** Every distinct opaque tone of the icons: pixel count, icons using it, largest share of one icon. */
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

/** The entries fixed before any clustering: the neutral axis and the shared tones. */
const fixedEntries = (tones: readonly PoolTone[], pictureCount: number): RGBA[] => {
  const shared = tones.filter((tone) => tone.pictures === pictureCount);
  const majorGreys = tones
    .filter((tone) => !shared.includes(tone) && isNeutral(tone.lab) && tone.share >= MAJOR_GREY_SHARE)
    .sort((a, b) => b.count - a.count);
  return [BLACK, WHITE, ...shared.map((tone) => tone.color), ...majorGreys.map((tone) => tone.color)];
};

const nearest = (lab: Oklab, pool: readonly Oklab[]): number =>
  pool.reduce((best, entry, at) => (distance(lab, entry) < distance(lab, pool[best]) ? at : best), 0);

/** The member minimizing the weighted distance to every other member. */
const medoidOf = (members: readonly PoolTone[]): PoolTone =>
  members.reduce((best, tone) => {
    const cost = (t: PoolTone): number => members.reduce((sum, m) => sum + m.count * distance(m.lab, t.lab), 0);
    return cost(tone) < cost(best) ? tone : best;
  });

/** |count| medoids over the tones the fixed entries leave, greys and colours competing for them. */
const toneMedoids = (hues: readonly PoolTone[], fixed: readonly Oklab[], count: number): PoolTone[] => {
  if (hues.length <= count) return [...hues];
  // Farthest-first seeds: each takes the tone the entries so far serve worst, by area.
  const medoids: PoolTone[] = [];
  while (medoids.length < count) {
    const pool = [...fixed, ...medoids.map((m) => m.lab)];
    const cost = (t: PoolTone): number => (pool.length === 0 ? t.count : t.count * distance(t.lab, pool[nearest(t.lab, pool)]) ** 2);
    medoids.push(hues.filter((t) => !medoids.includes(t)).reduce((a, b) => (cost(b) > cost(a) ? b : a)));
  }
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

/** The bank from the icons, in picture order. */
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

export { buildForeignIconPalette, PALETTE_COLORS };
export type { ForeignIconPalette };
