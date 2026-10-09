/* @layer shared-game @kind constants */
import { completesHeart } from './completes-heart';
import { isLastOfSet } from './is-last-of-set';
import { setNote } from './set-note';
import type { FlavourBuilder, FlavourKey } from './receipt-flavour.type';

const FLAVOUR_BUILDERS: Readonly<Record<FlavourKey, FlavourBuilder>> = {
  'small-key': ({ label, source, count }) => [
    `${label}, out of ${source}.${setNote(count, 'That is the first of them.', 'Not a locked door left.')}`,
    `${label}, out of ${source}.`,
    `${label}.`,
  ],
  'dungeon-item': ({ label, source }) => [
    `${source} was keeping ${label} for you.`,
    `${label}, from ${source}.`,
    `${label}.`,
  ],
  'heart-piece': ({ label, source, count }) => [
    completesHeart(count)
      ? `${label}, the last of them out of ${source}.`
      : `${label}, chipped out of ${source}.`,
    `${label}, from ${source}.`,
    `${label}.`,
  ],
  'heart-container': ({ label, source, count }) => [
    isLastOfSet(count)
      ? `${label}! The last heart there is, out of ${source}.`
      : `${label}! One more heart, out of ${source}.`,
    `${label}! From ${source}.`,
    `${label}!`,
  ],
  bottle: ({ label, source, count }) => [
    `${label}, empty and waiting, from ${source}.${setNote(count, '', 'A full rack now.')}`,
    `${label}, from ${source}.`,
    `${label}.`,
  ],
  crystal: ({ label, source, count }) => [
    `${label} rises out of ${source}.${setNote(count, '', 'That was the last one.')}`,
    `${label}, from ${source}.`,
    `${label}!`,
  ],
  pendant: ({ label, source, count }) => [
    `${label}! ${source} kept it safe.${setNote(count, '', 'All three, at last.')}`,
    `${label}! From ${source}.`,
    `${label}!`,
  ],
  triforce: ({ label, source }) => [
    `${label}, prised out of ${source}.`,
    `${label}, from ${source}.`,
    `${label}.`,
  ],
  progressive: ({ label, source, count }) => [
    isLastOfSet(count)
      ? `${label}! Nothing left to improve, out of ${source}.`
      : `${label}! ${source} had been holding out on you.`,
    `${label}! From ${source}.`,
    `${label}!`,
  ],
  quiver: ({ label, source }) => [
    `${label}! Out of ${source}, and the bow is worth carrying now.`,
    `${label}! From ${source}.`,
    `${label}!`,
  ],
  standard: ({ label, source }) => [
    `${label}! Hidden in ${source} all this time.`,
    `${label}! From ${source}.`,
    `${label}!`,
  ],
};

const DIRECT_FLAVOUR_KEYS: ReadonlySet<string> = new Set<FlavourKey>([
  'heart-piece', 'heart-container', 'bottle', 'crystal', 'pendant', 'triforce',
]);

export { DIRECT_FLAVOUR_KEYS, FLAVOUR_BUILDERS };
