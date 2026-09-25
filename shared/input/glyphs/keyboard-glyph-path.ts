/* @layer shared-input @kind logic */
/**
 * KeyboardEvent.code → the key-cap glyph that stands for it.
 *
 * Letters and digits are mechanical (KeyW → keyboard_w.svg), so only the
 * named keys need a table. An unmapped code answers null and the caller
 * falls back to text, exactly as it would for a controller position with no
 * artwork.
 */

const KEYBOARD_FOLDER = 'buttons/keyboard';

const keyboardAsset = (file: string): string => `${KEYBOARD_FOLDER}/${file}.svg`;

const NAMED_KEYS: Record<string, string> = {
  ArrowUp: 'keyboard_arrow_up', ArrowDown: 'keyboard_arrow_down',
  ArrowLeft: 'keyboard_arrow_left', ArrowRight: 'keyboard_arrow_right',
  Enter: 'keyboard_enter', NumpadEnter: 'keyboard_numpad_enter',
  Space: 'keyboard_space_icon', Tab: 'keyboard_tab_icon', Escape: 'keyboard_escape',
  ShiftLeft: 'keyboard_shift_icon', ShiftRight: 'keyboard_shift_icon',
  ControlLeft: 'keyboard_ctrl', ControlRight: 'keyboard_ctrl',
  AltLeft: 'keyboard_alt', AltRight: 'keyboard_alt',
  Backspace: 'keyboard_backspace_icon', CapsLock: 'keyboard_capslock_icon',
  Delete: 'keyboard_delete', Home: 'keyboard_home', End: 'keyboard_end',
  PageUp: 'keyboard_page_up', PageDown: 'keyboard_page_down', Insert: 'keyboard_insert',
};

const keyboardGlyphPath = (code: string): string | null => {
  if (/^Key[A-Z]$/.test(code)) return keyboardAsset(`keyboard_${code.slice(3).toLowerCase()}`);
  if (/^Digit\d$/.test(code)) return keyboardAsset(`keyboard_${code.slice(5)}`);
  if (/^F\d{1,2}$/.test(code)) return keyboardAsset(`keyboard_${code.toLowerCase()}`);
  const named = NAMED_KEYS[code];
  return named ? keyboardAsset(named) : null;
};

export { keyboardGlyphPath };
