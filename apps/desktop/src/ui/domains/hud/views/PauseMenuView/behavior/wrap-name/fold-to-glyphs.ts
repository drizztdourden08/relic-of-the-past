/* @layer renderer-hud @kind logic */
import { SEPARATORS, SPECIAL_FOLDS } from '../../PauseMenuView.constants';

const foldChar = (char: string): string => {
  if (SEPARATORS.has(char)) return ' ';
  const special = SPECIAL_FOLDS[char];
  if (special) return special;
  return char.normalize('NFD').toUpperCase().replace(/[^A-Z0-9 &]/g, '');
};

const foldToGlyphs = (text: string): string =>
  [...text].map(foldChar).join('').replace(/\s+/g, ' ').trim();

export { foldToGlyphs };
