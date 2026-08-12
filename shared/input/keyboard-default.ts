/* @layer shared-input @kind data */
/**
 * Keyboard preset — default key mappings for keyboard input. The keyboard
 * has no SDL entry (it is never a gamepad SDL enumerates), so unlike every
 * gamepad default this stays a plain hand-authored mapping rather than
 * something derived from the family layer.
 */

import type { DevicePreset, ButtonMapping } from '../types/controls';

const kb = (snesButton: ButtonMapping['snesButton'], code: string, label: string): ButtonMapping => {
  return { snesButton, binding: { type: 'keyboard', code, label }, icon: null };
};

const KEYBOARD_DEFAULT: DevicePreset = {
  id: 'keyboard-default',
  name: 'Keyboard',
  family: 'keyboard',
  inputApi: 'webapi',
  vendorIds: [],
  productIds: [],
  defaultMappings: [
    kb('Up',     'ArrowUp',    'Arrow Up'),
    kb('Down',   'ArrowDown',  'Arrow Down'),
    kb('Left',   'ArrowLeft',  'Arrow Left'),
    kb('Right',  'ArrowRight', 'Arrow Right'),
    kb('A',      'KeyD',       'D'),
    kb('B',      'KeyS',       'S'),
    kb('X',      'KeyA',       'A'),
    kb('Y',      'KeyW',       'W'),
    kb('L',      'KeyQ',       'Q'),
    kb('R',      'KeyE',       'E'),
    kb('Start',  'Enter',      'Enter'),
    kb('Select', 'ShiftRight', 'R.Shift'),
  ],
  brandLogoKey: 'keyboard',
  buttonIcons: {},
};

export { KEYBOARD_DEFAULT };
