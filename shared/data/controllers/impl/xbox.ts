/**
 * Xbox Controllers (360, One, Series X|S, Elite, Adaptive)
 * VID: 0x045E  PIDs: various
 *
 * Uses XInput/Web Gamepad API — no raw HID parsing needed.
 * Windows claims exclusive access via XInput driver.
 */

import { BaseController, type ControllerButton, type ControllerAxis } from '../base';
import { registerController } from '../registry';
import type { ButtonMapping, ButtonIcon } from '../../../types/controls';

const icon = (key: string, label: string): ButtonIcon => ({ key, path: null, label });

const ICONS: Record<string, ButtonIcon> = {
  'xbox-a':      icon('xbox-a', 'A Button'),
  'xbox-b':      icon('xbox-b', 'B Button'),
  'xbox-x':      icon('xbox-x', 'X Button'),
  'xbox-y':      icon('xbox-y', 'Y Button'),
  'xbox-lb':     icon('xbox-lb', 'Left Bumper'),
  'xbox-rb':     icon('xbox-rb', 'Right Bumper'),
  'xbox-lt':     icon('xbox-lt', 'Left Trigger'),
  'xbox-rt':     icon('xbox-rt', 'Right Trigger'),
  'xbox-view':   icon('xbox-view', 'View'),
  'xbox-menu':   icon('xbox-menu', 'Menu'),
  'xbox-ls':     icon('xbox-ls', 'Left Stick'),
  'xbox-rs':     icon('xbox-rs', 'Right Stick'),
  'xbox-dup':    icon('xbox-dup', 'D-Pad Up'),
  'xbox-ddown':  icon('xbox-ddown', 'D-Pad Down'),
  'xbox-dleft':  icon('xbox-dleft', 'D-Pad Left'),
  'xbox-dright': icon('xbox-dright', 'D-Pad Right'),
  'xbox-home':   icon('xbox-home', 'Xbox Button'),
  'xbox-share':  icon('xbox-share', 'Share'),
};

function btn(snesButton: ButtonMapping['snesButton'], index: number, iconData: ButtonIcon | null): ButtonMapping {
  return { snesButton, binding: { type: 'gamepad-button', index }, icon: iconData };
}

const DEFAULT_MAPPINGS: ButtonMapping[] = [
  btn('A',      0,  ICONS['xbox-a']),
  btn('B',      1,  ICONS['xbox-b']),
  btn('X',      2,  ICONS['xbox-x']),
  btn('Y',      3,  ICONS['xbox-y']),
  btn('L',      4,  ICONS['xbox-lb']),
  btn('R',      5,  ICONS['xbox-rb']),
  btn('Start',  9,  ICONS['xbox-menu']),
  btn('Select', 8,  ICONS['xbox-view']),
  btn('Up',     12, ICONS['xbox-dup']),
  btn('Down',   13, ICONS['xbox-ddown']),
  btn('Left',   14, ICONS['xbox-dleft']),
  btn('Right',  15, ICONS['xbox-dright']),
];

const BUTTONS: ControllerButton[] = [
  { id: 'a',       label: 'A Button',     icon: 'xbox-a',      category: 'face' },
  { id: 'b',       label: 'B Button',     icon: 'xbox-b',      category: 'face' },
  { id: 'x',       label: 'X Button',     icon: 'xbox-x',      category: 'face' },
  { id: 'y',       label: 'Y Button',     icon: 'xbox-y',      category: 'face' },
  { id: 'l',       label: 'L Bumper',     icon: 'xbox-lb',     category: 'shoulder' },
  { id: 'r',       label: 'R Bumper',     icon: 'xbox-rb',     category: 'shoulder' },
  { id: 'zl',      label: 'L Trigger',    icon: 'xbox-lt',     category: 'trigger' },
  { id: 'zr',      label: 'R Trigger',    icon: 'xbox-rt',     category: 'trigger' },
  { id: 'minus',   label: 'View',         icon: 'xbox-view',   category: 'system' },
  { id: 'plus',    label: 'Menu',         icon: 'xbox-menu',   category: 'system' },
  { id: 'lstick',  label: 'L Stick',      icon: 'xbox-ls',     category: 'stick' },
  { id: 'rstick',  label: 'R Stick',      icon: 'xbox-rs',     category: 'stick' },
  { id: 'dpUp',    label: 'D-Pad Up',     icon: 'xbox-dup',    category: 'dpad' },
  { id: 'dpDown',  label: 'D-Pad Down',   icon: 'xbox-ddown',  category: 'dpad' },
  { id: 'dpLeft',  label: 'D-Pad Left',   icon: 'xbox-dleft',  category: 'dpad' },
  { id: 'dpRight', label: 'D-Pad Right',  icon: 'xbox-dright', category: 'dpad' },
  { id: 'home',    label: 'Xbox',         icon: 'xbox-home',   category: 'system' },
  { id: 'share',   label: 'Share',        icon: 'xbox-share',  category: 'system' },
];

const AXES: ControllerAxis[] = [
  { id: 'leftX',        label: 'Left Stick X',   category: 'stick' },
  { id: 'leftY',        label: 'Left Stick Y',   category: 'stick' },
  { id: 'rightX',       label: 'Right Stick X',  category: 'stick' },
  { id: 'rightY',       label: 'Right Stick Y',  category: 'stick' },
  { id: 'leftTrigger',  label: 'L Trigger',      category: 'trigger' },
  { id: 'rightTrigger', label: 'R Trigger',      category: 'trigger' },
];

// All known Xbox PIDs
const XBOX_PIDS = [
  '028e', '028f', '0719', '02ff',
  '02d1', '02dd', '02e3', '02e0', '02fd',
  '0b00', '0b05', '0b0a',
  '0b12', '0b13', '0b20', '0b21', '0b22',
];

class XboxController extends BaseController {
  readonly id = 'xbox';
  readonly name = 'Xbox Controller';
  readonly family = 'xbox' as const;
  readonly inputApi = 'xinput' as const;
  readonly vendorIds = ['045e'];
  readonly productIds = XBOX_PIDS;
  readonly brandLogoKey = 'xbox';
  readonly buttonIcons = ICONS;
  readonly defaultMappings = DEFAULT_MAPPINGS;
  readonly buttons = BUTTONS;
  readonly axes = AXES;

  supportsVibration(): boolean { return true; }
}

registerController(new XboxController());
