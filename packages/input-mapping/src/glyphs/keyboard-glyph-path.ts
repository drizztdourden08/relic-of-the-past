/* @layer shared-input @kind logic */
import { KEYBOARD_FOLDER, NAMED_KEYS } from './keyboard-glyph-path.constants';

const keyboardAsset = (file: string): string => `${KEYBOARD_FOLDER}/${file}.svg`;

const keyboardGlyphPath = (code: string): string | null => {
  if (/^Key[A-Z]$/.test(code)) return keyboardAsset(`keyboard_${code.slice(3).toLowerCase()}`);
  if (/^Digit\d$/.test(code)) return keyboardAsset(`keyboard_${code.slice(5)}`);
  if (/^F\d{1,2}$/.test(code)) return keyboardAsset(`keyboard_${code.toLowerCase()}`);
  const named = NAMED_KEYS[code];
  return named ? keyboardAsset(named) : null;
};

export { keyboardGlyphPath };
