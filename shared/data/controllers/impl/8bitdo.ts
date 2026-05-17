/**
 * 8BitDo Controllers (Pro 2, SN30 Pro, SN30 Pro+)
 * VID: 0x2DC8  PIDs: various
 *
 * Uses Web Gamepad API via Chromium's HID remapping in XInput mode.
 * Nintendo-style button layout.
 */

import { BaseController, type ControllerButton, type ControllerAxis } from '../base';
import { registerController } from '../registry';
import type { ButtonMapping, ButtonIcon } from '../../../types/controls';

const icon = (key: string, label: string): ButtonIcon => ({ key, path: null, label });

const ICONS: Record<string, ButtonIcon> = {
  '8bitdo-b':      icon('8bitdo-b', 'B'),
  '8bitdo-a':      icon('8bitdo-a', 'A'),
  '8bitdo-y':      icon('8bitdo-y', 'Y'),
  '8bitdo-x':      icon('8bitdo-x', 'X'),
  '8bitdo-l':      icon('8bitdo-l', 'L'),
  '8bitdo-r':      icon('8bitdo-r', 'R'),
  '8bitdo-select': icon('8bitdo-select', 'Select'),
  '8bitdo-start':  icon('8bitdo-start', 'Start'),
  '8bitdo-dup':    icon('8bitdo-dup', '↑'),
  '8bitdo-ddown':  icon('8bitdo-ddown', '↓'),
  '8bitdo-dleft':  icon('8bitdo-dleft', '←'),
  '8bitdo-dright': icon('8bitdo-dright', '→'),
  '8bitdo-home':   icon('8bitdo-home', 'Home'),
  '8bitdo-star':   icon('8bitdo-star', 'Star'),
};

function btn(snesButton: ButtonMapping['snesButton'], index: number, iconData: ButtonIcon | null): ButtonMapping {
  return { snesButton, binding: { type: 'gamepad-button', index }, icon: iconData };
}

const DEFAULT_MAPPINGS: ButtonMapping[] = [
  btn('B',      0,  ICONS['8bitdo-b']),
  btn('A',      1,  ICONS['8bitdo-a']),
  btn('Y',      2,  ICONS['8bitdo-y']),
  btn('X',      3,  ICONS['8bitdo-x']),
  btn('L',      4,  ICONS['8bitdo-l']),
  btn('R',      5,  ICONS['8bitdo-r']),
  btn('Select', 8,  ICONS['8bitdo-select']),
  btn('Start',  9,  ICONS['8bitdo-start']),
  btn('Up',     12, ICONS['8bitdo-dup']),
  btn('Down',   13, ICONS['8bitdo-ddown']),
  btn('Left',   14, ICONS['8bitdo-dleft']),
  btn('Right',  15, ICONS['8bitdo-dright']),
];

const BUTTONS: ControllerButton[] = [
  { id: 'a',       label: 'A Button',    icon: '8bitdo-a',      category: 'face' },
  { id: 'b',       label: 'B Button',    icon: '8bitdo-b',      category: 'face' },
  { id: 'x',       label: 'X Button',    icon: '8bitdo-x',      category: 'face' },
  { id: 'y',       label: 'Y Button',    icon: '8bitdo-y',      category: 'face' },
  { id: 'l',       label: 'L Bumper',    icon: '8bitdo-l',      category: 'shoulder' },
  { id: 'r',       label: 'R Bumper',    icon: '8bitdo-r',      category: 'shoulder' },
  { id: 'zl',      label: 'ZL Trigger',  icon: '8bitdo-l',      category: 'trigger' },
  { id: 'zr',      label: 'ZR Trigger',  icon: '8bitdo-r',      category: 'trigger' },
  { id: 'plus',    label: 'Start',       icon: '8bitdo-start',  category: 'system' },
  { id: 'minus',   label: 'Select',      icon: '8bitdo-select', category: 'system' },
  { id: 'lstick',  label: 'L Stick',     icon: '8bitdo-l',      category: 'stick' },
  { id: 'rstick',  label: 'R Stick',     icon: '8bitdo-r',      category: 'stick' },
  { id: 'dpUp',    label: 'D-Pad Up',    icon: '8bitdo-dup',    category: 'dpad' },
  { id: 'dpDown',  label: 'D-Pad Down',  icon: '8bitdo-ddown',  category: 'dpad' },
  { id: 'dpLeft',  label: 'D-Pad Left',  icon: '8bitdo-dleft',  category: 'dpad' },
  { id: 'dpRight', label: 'D-Pad Right', icon: '8bitdo-dright', category: 'dpad' },
  { id: 'home',    label: 'Home',        icon: '8bitdo-home',   category: 'system' },
  { id: 'star',    label: 'Star',        icon: '8bitdo-star',   category: 'system' },
];

const AXES: ControllerAxis[] = [
  { id: 'leftX',  label: 'Left Stick X',  category: 'stick' },
  { id: 'leftY',  label: 'Left Stick Y',  category: 'stick' },
  { id: 'rightX', label: 'Right Stick X', category: 'stick' },
  { id: 'rightY', label: 'Right Stick Y', category: 'stick' },
];

const BITDO_PIDS = ['6003', '6002', '6001', '6100'];

class EightBitDoController extends BaseController {
  readonly id = '8bitdo';
  readonly name = '8BitDo Pro 2';
  readonly family = '8bitdo' as const;
  readonly inputApi = 'hid' as const;
  readonly vendorIds = ['2dc8'];
  readonly productIds = BITDO_PIDS;
  readonly brandLogoKey = '8bitdo';
  readonly buttonIcons = ICONS;
  readonly defaultMappings = DEFAULT_MAPPINGS;
  readonly buttons = BUTTONS;
  readonly axes = AXES;
}

registerController(new EightBitDoController());
