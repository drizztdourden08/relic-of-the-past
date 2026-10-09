/* @layer shared-input @kind data */
import type { DevicePreset } from './controls/devices/devices.type';

const KEYBOARD_DEFAULT: DevicePreset = {
  id: 'keyboard-default',
  name: 'Keyboard',
  family: 'keyboard',
  inputApi: 'webapi',
  vendorIds: [],
  productIds: [],
  defaultMappings: [
    { snesButton: 'Up', binding: { type: 'keyboard', code: 'ArrowUp', label: 'Arrow Up' }, icon: null },
    { snesButton: 'Down', binding: { type: 'keyboard', code: 'ArrowDown', label: 'Arrow Down' }, icon: null },
    { snesButton: 'Left', binding: { type: 'keyboard', code: 'ArrowLeft', label: 'Arrow Left' }, icon: null },
    { snesButton: 'Right', binding: { type: 'keyboard', code: 'ArrowRight', label: 'Arrow Right' }, icon: null },
    { snesButton: 'A', binding: { type: 'keyboard', code: 'KeyD', label: 'D' }, icon: null },
    { snesButton: 'B', binding: { type: 'keyboard', code: 'KeyS', label: 'S' }, icon: null },
    { snesButton: 'X', binding: { type: 'keyboard', code: 'KeyA', label: 'A' }, icon: null },
    { snesButton: 'Y', binding: { type: 'keyboard', code: 'KeyW', label: 'W' }, icon: null },
    { snesButton: 'L', binding: { type: 'keyboard', code: 'KeyQ', label: 'Q' }, icon: null },
    { snesButton: 'R', binding: { type: 'keyboard', code: 'KeyE', label: 'E' }, icon: null },
    { snesButton: 'Start', binding: { type: 'keyboard', code: 'Enter', label: 'Enter' }, icon: null },
    { snesButton: 'Select', binding: { type: 'keyboard', code: 'ShiftRight', label: 'R.Shift' }, icon: null },
  ],
  brandLogoKey: 'keyboard',
  buttonIcons: {},
};

export { KEYBOARD_DEFAULT };
