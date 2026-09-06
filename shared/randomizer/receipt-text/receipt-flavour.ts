/* @layer shared-game @kind logic */
/**
 * The voice of a found-item receipt. Every line still carries the numbers,
 * which live in the label the caller hands in (numbered-item-label.ts), but
 * the sentence around them is written per item class, so a key, a heart and a
 * crystal do not read as one template with the nouns swapped. Each class also
 * answers to WHERE this copy sits in its set: the first of them, the one that
 * completes them, or another along the way; the heart pieces answer to the
 * quarter instead, since four of them are a heart whatever the seed's total;
 * the retro bow's quiver answers for itself, since nothing else in the seed
 * turns a carried weapon from useless into usable.
 * Every class returns candidates, fullest first, and the composer keeps the
 * first that fits the box (receipt-line.type.ts), so a long location name
 * costs the flavour, then the source, and never the numbers.
 */
import { RETRO_QUIVER_ITEM } from '../ap-world/retro/retro-bow.data';
import { countClassOf } from './receipt-counts';
import type { ReceiptCount } from './receipt-counts';

/** The classes that get their own wording; everything else takes 'standard'. */
type FlavourKey =
  | 'small-key' | 'dungeon-item' | 'heart-piece' | 'heart-container'
  | 'bottle' | 'crystal' | 'pendant' | 'triforce' | 'progressive' | 'quiver' | 'standard';

interface FlavourParams {
  key: FlavourKey;
  /** The item label, numbers included. */
  label: string;
  /** The location this copy came out of. */
  source: string;
  /** The seed's numbers for this copy; absent = nothing to place it in a set. */
  count?: ReceiptCount;
}

const PIECES_PER_HEART = 4;

const isFirst = (count: ReceiptCount | undefined): boolean =>
  count !== undefined && count.total > 1 && count.ordinal === 1;

const isLast = (count: ReceiptCount | undefined): boolean =>
  count !== undefined && count.total > 1 && count.ordinal === count.total;

/** True when this piece is the fourth quarter: a whole heart, whatever the total. */
const completesHeart = (count: ReceiptCount | undefined): boolean =>
  count !== undefined && count.ordinal % PIECES_PER_HEART === 0;

/** The set-position clause of a class that has one, or '' along the way. */
const setNote = (count: ReceiptCount | undefined, first: string, last: string): string => {
  const note = isLast(count) ? last : (isFirst(count) ? first : '');
  return note === '' ? '' : ` ${note}`;
};

type Builder = (params: FlavourParams) => readonly string[];

const smallKey: Builder = ({ label, source, count }) => [
  `${label}, out of ${source}.${setNote(count, 'That is the first of them.', 'Not a locked door left.')}`,
  `${label}, out of ${source}.`,
  `${label}.`,
];

const dungeonItem: Builder = ({ label, source }) => [
  `${source} was keeping ${label} for you.`,
  `${label}, from ${source}.`,
  `${label}.`,
];

// The label already says which quarter this is and, on the fourth, that it made a
// heart (numbered-item-label.ts), so the sentence only names where it came from.
const heartPiece: Builder = ({ label, source, count }) => [
  completesHeart(count)
    ? `${label}, the last of them out of ${source}.`
    : `${label}, chipped out of ${source}.`,
  `${label}, from ${source}.`,
  `${label}.`,
];

const heartContainer: Builder = ({ label, source, count }) => [
  isLast(count)
    ? `${label}! The last heart there is, out of ${source}.`
    : `${label}! One more heart, out of ${source}.`,
  `${label}! From ${source}.`,
  `${label}!`,
];

const bottle: Builder = ({ label, source, count }) => [
  `${label}, empty and waiting, from ${source}.${setNote(count, '', 'A full rack now.')}`,
  `${label}, from ${source}.`,
  `${label}.`,
];

const crystal: Builder = ({ label, source, count }) => [
  `${label} rises out of ${source}.${setNote(count, '', 'That was the last one.')}`,
  `${label}, from ${source}.`,
  `${label}!`,
];

const pendant: Builder = ({ label, source, count }) => [
  `${label}! ${source} kept it safe.${setNote(count, '', 'All three, at last.')}`,
  `${label}! From ${source}.`,
  `${label}!`,
];

const triforce: Builder = ({ label, source }) => [
  `${label}, prised out of ${source}.`,
  `${label}, from ${source}.`,
  `${label}.`,
];

const progressive: Builder = ({ label, source, count }) => [
  isLast(count)
    ? `${label}! Nothing left to improve, out of ${source}.`
    : `${label}! ${source} had been holding out on you.`,
  `${label}! From ${source}.`,
  `${label}!`,
];

/**
 * The retro bow's quiver: the one item in the seed whose whole point is that
 * the bow was useless without it, so the line says that and not "hidden all
 * this time". It only ever shows in a seed that placed one, which is a retro
 * seed with shuffled shops (retro/retro-pool.ts).
 */
const quiver: Builder = ({ label, source }) => [
  `${label}! Out of ${source}, and the bow is worth carrying now.`,
  `${label}! From ${source}.`,
  `${label}!`,
];

const standard: Builder = ({ label, source }) => [
  `${label}! Hidden in ${source} all this time.`,
  `${label}! From ${source}.`,
  `${label}!`,
];

const BUILDERS: Readonly<Record<FlavourKey, Builder>> = {
  'small-key': smallKey,
  'dungeon-item': dungeonItem,
  'heart-piece': heartPiece,
  'heart-container': heartContainer,
  bottle,
  crystal,
  pendant,
  triforce,
  progressive,
  quiver,
  standard,
};

/** The count classes that map straight onto a flavour of the same name. */
const DIRECT_KEYS: ReadonlySet<string> = new Set<FlavourKey>([
  'heart-piece', 'heart-container', 'bottle', 'crystal', 'pendant', 'triforce',
]);

/**
 * Which voice an item speaks in: its count class where it has one (the seed
 * counts it), otherwise the dungeon-item shape for the uncounted palace
 * pieces, otherwise the plain found line.
 */
const flavourKeyOf = (itemName: string, isDungeonItem: boolean): FlavourKey => {
  if (itemName === RETRO_QUIVER_ITEM) return 'quiver';
  const countClass = countClassOf(itemName);
  if (countClass !== undefined) {
    if (countClass.startsWith('small-key:')) return 'small-key';
    if (countClass.startsWith('progressive:')) return 'progressive';
    if (DIRECT_KEYS.has(countClass)) return countClass as FlavourKey;
  }
  return isDungeonItem ? 'dungeon-item' : 'standard';
};

/** The found-item candidates of one class, fullest first. */
const foundCandidates = (params: FlavourParams): readonly string[] => BUILDERS[params.key](params);

export { flavourKeyOf, foundCandidates };
export type { FlavourKey, FlavourParams };
