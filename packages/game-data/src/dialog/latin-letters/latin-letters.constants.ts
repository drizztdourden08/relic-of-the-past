/* @layer shared-game @kind constants */
import type { OverlayId } from './latin-letters.type';

const LATIN_RANGES: readonly (readonly [number, number])[] = [
  [0x00c0, 0x024f],
  [0x1e00, 0x1eff],
  [0x2c60, 0x2c7f],
];

const IPA_LETTERS = 'ɐɓɔɖɗəɛɣɨɯɲɹʉʋʌʒ';

const MARK_OF_COMBINING: ReadonlyMap<number, string> = new Map([
  [0x0300, 'grave'], [0x0301, 'acute'], [0x0302, 'circumflex'], [0x0303, 'tilde'], [0x0304, 'macron'],
  [0x0306, 'breve'], [0x0307, 'dot'], [0x0308, 'diaeresis'], [0x0309, 'hook'], [0x030a, 'ring'],
  [0x030b, 'doubleAcute'], [0x030c, 'caron'], [0x030f, 'doubleGrave'], [0x0311, 'invertedBreve'],
  [0x031b, 'horn'], [0x0323, 'dotBelow'], [0x0324, 'diaeresisBelow'], [0x0325, 'ringBelow'],
  [0x0326, 'commaBelow'], [0x0327, 'cedilla'], [0x0328, 'ogonek'], [0x032d, 'circumflexBelow'],
  [0x032e, 'breveBelow'], [0x0330, 'tildeBelow'], [0x0331, 'macronBelow'],
]);

const OVERLAY_OF_MARK: ReadonlyMap<string, OverlayId> = new Map([
  ['horn', 'horn'],
  ['apostropheRight', 'apostropheRight'],
]);
const APOSTROPHE_CARON_BASES: ReadonlySet<string> = new Set(['d', 't', 'l', 'L']);
const COMMA_CEDILLA_BASES: ReadonlySet<string> = new Set(['G', 'k', 'K', 'l', 'L', 'n', 'N', 'r', 'R']);
const TURNED_COMMA_BASES: ReadonlySet<string> = new Set(['g']);
const TITTLE_BASES: ReadonlySet<string> = new Set(['i', 'j']);
const SIDE_TONES: ReadonlySet<string> = new Set(['acute', 'grave', 'hook']);
const SIDE_HOSTS: ReadonlySet<string> = new Set(['circumflex']);

const MAX_SQUASH = 5;
const MIN_SQUASHED_BODY = 6;
const MAX_DEPTH = 3;
const QUESTION = '?';

export {
  APOSTROPHE_CARON_BASES, COMMA_CEDILLA_BASES, IPA_LETTERS, LATIN_RANGES, MARK_OF_COMBINING, MAX_DEPTH,
  MAX_SQUASH, MIN_SQUASHED_BODY, OVERLAY_OF_MARK, QUESTION, SIDE_HOSTS, SIDE_TONES, TITTLE_BASES, TURNED_COMMA_BASES,
};
