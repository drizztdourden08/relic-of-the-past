/* @layer renderer-lib @kind constants */
import { SDL_AXIS } from '@shared/input/sdl-buttons';

const AXIS_FALLBACK: Record<number, Record<'-' | '+', string>> = {
  [SDL_AXIS.LEFT_X]: { '-': 'generic-stick-left', '+': 'generic-stick-right' },
  [SDL_AXIS.RIGHT_X]: { '-': 'generic-stick-left', '+': 'generic-stick-right' },
  [SDL_AXIS.LEFT_Y]: { '-': 'generic-stick-up', '+': 'generic-stick-down' },
  [SDL_AXIS.RIGHT_Y]: { '-': 'generic-stick-up', '+': 'generic-stick-down' },
  [SDL_AXIS.LEFT_TRIGGER]: { '-': 'generic-trigger-a', '+': 'generic-trigger-a' },
  [SDL_AXIS.RIGHT_TRIGGER]: { '-': 'generic-trigger-b', '+': 'generic-trigger-b' },
};

const KEY_CODE_LABELS: Record<string, string> = {
  ArrowUp: 'Arrow Up', ArrowDown: 'Arrow Down', ArrowLeft: 'Arrow Left', ArrowRight: 'Arrow Right',
  ShiftLeft: 'L.Shift', ShiftRight: 'R.Shift',
  ControlLeft: 'L.Ctrl', ControlRight: 'R.Ctrl',
  AltLeft: 'L.Alt', AltRight: 'R.Alt',
  Enter: 'Enter', Space: 'Space', Backspace: 'Bksp',
  Tab: 'Tab', Escape: 'Esc', CapsLock: 'Caps',
  PageUp: 'Page Up', PageDown: 'Page Down',
};

export { AXIS_FALLBACK, KEY_CODE_LABELS };
