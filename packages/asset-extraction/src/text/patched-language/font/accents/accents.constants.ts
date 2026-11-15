/* @layer shared-asset-extraction @kind constants */
const MAX_MARK_ROWS = 6;

const MAX_REMOVED = 2;

const MARK_TOLERANCE = 1;

const BASE_SHIFTS: readonly number[] = [0, 1, -1];

const SHIFT_COST = 0.5;

const SHAPE_GUESS_SCORE = 2;

const MAX_GUESS_HEIGHT = 3;

const TILDE_MIN_WIDTH = 3;

const MARK = {
  acute: '́',
  grave: '̀',
  circumflex: '̂',
  tilde: '̃',
  diaeresis: '̈',
  cedilla: '̧',
  caron: '̌',
} as const;

const MARK_NAMES: Readonly<Record<string, string>> = {
  '́': 'acute',
  '̀': 'grave',
  '̂': 'circumflex',
  '̃': 'tilde',
  '̈': 'diaeresis',
  '̧': 'cedilla',
  '̌': 'caron',
  '̊': 'ring',
  '̨': 'ogonek',
  '̇': 'dot',
  '̆': 'breve',
};

const CEDILLA_LETTERS: readonly string[] = ['c', 'C'];

const PLAIN_LETTER = /^[A-Za-z]$/;

const FLIPS: readonly { from: string; token: string }[] = [
  { from: '!', token: '¡' },
  { from: '?', token: '¿' },
];

const NEIGHBOURS: readonly (readonly [number, number])[] = [
  [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1],
];

export {
  BASE_SHIFTS, CEDILLA_LETTERS, FLIPS, MARK, MARK_NAMES, MARK_TOLERANCE, MAX_GUESS_HEIGHT, MAX_MARK_ROWS, MAX_REMOVED,
  NEIGHBOURS, PLAIN_LETTER, SHAPE_GUESS_SCORE, SHIFT_COST, TILDE_MIN_WIDTH,
};
