/* @layer shared-input @kind constants */
const KEYBOARD_FOLDER = 'buttons/keyboard';

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

export { KEYBOARD_FOLDER, NAMED_KEYS };
