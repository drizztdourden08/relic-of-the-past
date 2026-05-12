/**
 * Keyboard preset — default key mappings for keyboard input.
 */

import type { ControllerPreset, ButtonMapping } from '../../types/controls';

function kb(snesButton: ButtonMapping['snesButton'], code: string, label: string): ButtonMapping {
  return { snesButton, binding: { type: 'keyboard', code, label }, icon: null };
}

export const KEYBOARD_DEFAULT: ControllerPreset = {
  id: 'keyboard-default',
  name: 'Keyboard',
  family: 'keyboard',
  inputApi: 'webapi',
  vendorIds: [],
  productIds: [],
  defaultMappings: [
    kb('Up',     'ArrowUp',    '↑'),
    kb('Down',   'ArrowDown',  '↓'),
    kb('Left',   'ArrowLeft',  '←'),
    kb('Right',  'ArrowRight', '→'),
    kb('A',      'KeyS',       'S'),
    kb('B',      'KeyX',       'X'),
    kb('X',      'KeyA',       'A'),
    kb('Y',      'KeyZ',       'Z'),
    kb('L',      'KeyD',       'D'),
    kb('R',      'KeyC',       'C'),
    kb('Start',  'Enter',      'Enter'),
    kb('Select', 'ShiftRight', 'R.Shift'),
  ],
  brandLogoKey: 'keyboard',
  buttonIcons: {},
};
