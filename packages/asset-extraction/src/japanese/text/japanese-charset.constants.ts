/* @layer shared-asset-extraction @kind constants */
const KANA_CHARSET = [
  'あいうえおやゆよかきくけこわをんさしすせそがぎぐたちつてとげござ',
  'なにぬねのじずぜはひふへほぞだぢまみむめもづでどらりるれろばびぶ',
  'べぼぱぴぷぺぽゃゅょっぁぃぅぇぉアイウエオヤユヨカキクケコワヲン',
  'サシスセソガギグタチツテトゲゴザナニヌネノジズゼハヒフヘホゾダヂ',
  'マミムメモヅデドラリルレロバビブベボパピプペポャュョッァィゥェォ',
  '0123456789ABCDEFGHIJKLMNOPQRSTUV',
  `WXYZ『』?!、ー<>${String.fromCharCode(0x2026)}。~`,
].join('');

const SPACE_GLYPH = 0xff;

const SPACE_CHAR = ' ';

const IDEOGRAPHIC_SPACE = '　';

const PRIVATE_USE_BASE = 0xe000;

const GLYPH_LIMIT = 0x200;

export { GLYPH_LIMIT, IDEOGRAPHIC_SPACE, KANA_CHARSET, PRIVATE_USE_BASE, SPACE_CHAR, SPACE_GLYPH };
