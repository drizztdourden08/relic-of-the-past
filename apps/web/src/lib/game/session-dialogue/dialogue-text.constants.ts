/* @layer bridge-wasm @kind constants */
const UNKNOWN = '?';
const MAX_DEPTH = 2;

const TYPOGRAPHIC: ReadonlyMap<number, string> = new Map([
  [0x2010, '-'], [0x2011, '-'], [0x2012, '-'], [0x2013, '-'], [0x2014, '-'], [0x2015, '-'], [0x2212, '-'],
  [0x2018, "'"], [0x2019, "'"], [0x201a, ','], [0x201b, "'"], [0x2032, "'"], [0x00b4, "'"],
  [0x201c, '"'], [0x201d, '"'], [0x201e, '"'], [0x2033, '"'], [0x00ab, '"'], [0x00bb, '"'],
  [0x2026, '...'], [0x00d7, 'x'], [0x00b7, '.'], [0x2022, '*'],
]);

const LETTERS: ReadonlyMap<string, string> = new Map([
  ['ß', 'ss'], ['ẞ', 'SS'], ['æ', 'ae'], ['Æ', 'AE'], ['œ', 'oe'], ['Œ', 'OE'], ['ø', 'o'], ['Ø', 'O'],
  ['đ', 'd'], ['Đ', 'D'], ['ð', 'd'], ['Ð', 'D'], ['þ', 'th'], ['Þ', 'Th'], ['ł', 'l'], ['Ł', 'L'],
  ['ı', 'i'], ['ħ', 'h'], ['Ħ', 'H'], ['ŧ', 't'], ['Ŧ', 'T'],
]);

const NEAREST: ReadonlyMap<string, string> = new Map([
  ['[', '('], [']', ')'], ['{', '('], ['}', ')'], ['\\', '/'], [';', ','],
]);

const COMBINING = /\p{M}/gu;
const SPACE = /^\s$/u;
const INVISIBLE = /^[\p{Cc}\p{Cf}\p{M}]$/u;

export { UNKNOWN, MAX_DEPTH, TYPOGRAPHIC, LETTERS, NEAREST, COMBINING, SPACE, INVISIBLE };
