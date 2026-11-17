/* @layer shared-game @kind logic */
import {
  HYPHEN_TILE, LETTER_COUNT, LETTER_FIRST_TILE, SPACE_TILE, TILE_MASK, WORDS_PER_ENTRY,
} from './names-from-screens.constants';

const charOfTile = (tile: number): string | null => {
  if (tile === SPACE_TILE) return ' ';
  if (tile === HYPHEN_TILE) return '-';
  const letter = tile - LETTER_FIRST_TILE;
  return letter >= 0 && letter < LETTER_COUNT ? String.fromCharCode(65 + letter) : null;
};

const decodePauseEntry = (words: Uint16Array, entry: number): string | null => {
  const start = entry * WORDS_PER_ENTRY;
  if (start + WORDS_PER_ENTRY > words.length) return null;
  let text = '';
  for (let i = 0; i < WORDS_PER_ENTRY; i += 1) {
    const char = charOfTile((words[start + i] ?? 0) & TILE_MASK);
    if (char === null) return null;
    text += char;
  }
  const name = text.replace(/\s+/g, ' ').trim();
  return name === '' ? null : name;
};

export { decodePauseEntry };
