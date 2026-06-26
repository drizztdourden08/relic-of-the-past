/* @layer shared-input @kind data */
/**
 * PlayStation Controllers (DualShock 4, DualSense, DualSense Edge)
 * VID: 0x054C  PIDs: various
 *
 * Input arrives as raw HID report 0x01, parsed in sony-hid.ts into the
 * standard-gamepad button/axis order the mappings below assume.
 */

import { BaseController, type ControllerButton, type ControllerAxis, type ParsedInput, type StickDefaults } from '../../base';
import { registerController } from '../../registry';
import type { ButtonMapping, ButtonIcon } from '../../../types/controls';
import { icon, btn } from './builders';
import { parseDualShock4Report, parseDualSenseReport } from './sony-hid';

// 8-bit sticks centered at 0x80; deadzones tuned to ride out resting jitter.
const SONY_STICK_DEFAULTS: StickDefaults = {
  encoding: '8bit-centered',
  center: 128,
  range: 128,
  innerDeadzone: 0.08,
  outerDeadzone: 0.95,
};

const PS_ICONS: Record<string, ButtonIcon> = {
  'ps-cross':    icon('ps-cross', 'Cross Button'),
  'ps-circle':   icon('ps-circle', 'Circle Button'),
  'ps-square':   icon('ps-square', 'Square Button'),
  'ps-triangle': icon('ps-triangle', 'Triangle Button'),
  'ps-l1':       icon('ps-l1', 'L1 Bumper'),
  'ps-r1':       icon('ps-r1', 'R1 Bumper'),
  'ps-l2':       icon('ps-l2', 'L2 Trigger'),
  'ps-r2':       icon('ps-r2', 'R2 Trigger'),
  'ps-share':    icon('ps-share', 'Share'),
  'ps-create':   icon('ps-create', 'Create'),
  'ps-options':  icon('ps-options', 'Options'),
  'ps-l3':       icon('ps-l3', 'Left Stick'),
  'ps-r3':       icon('ps-r3', 'Right Stick'),
  'ps-dup':      icon('ps-dup', 'D-Pad Up'),
  'ps-ddown':    icon('ps-ddown', 'D-Pad Down'),
  'ps-dleft':    icon('ps-dleft', 'D-Pad Left'),
  'ps-dright':   icon('ps-dright', 'D-Pad Right'),
  'ps-home':     icon('ps-home', 'PS Button'),
  'ps-touchpad': icon('ps-touchpad', 'Touchpad'),
  'ps-mute':     icon('ps-mute', 'Mute'),
};

const PS_MAPPINGS: ButtonMapping[] = [
  btn('B',      0,  PS_ICONS['ps-cross']),
  btn('A',      1,  PS_ICONS['ps-circle']),
  btn('Y',      2,  PS_ICONS['ps-square']),
  btn('X',      3,  PS_ICONS['ps-triangle']),
  btn('L',      4,  PS_ICONS['ps-l1']),
  btn('R',      5,  PS_ICONS['ps-r1']),
  btn('Select', 8,  PS_ICONS['ps-share']),
  btn('Start',  9,  PS_ICONS['ps-options']),
  btn('Up',     12, PS_ICONS['ps-dup']),
  btn('Down',   13, PS_ICONS['ps-ddown']),
  btn('Left',   14, PS_ICONS['ps-dleft']),
  btn('Right',  15, PS_ICONS['ps-dright']),
];

const PS_BUTTONS: ControllerButton[] = [
  { id: 'cross',    label: 'Cross',      icon: 'ps-cross',     category: 'face' },
  { id: 'circle',   label: 'Circle',     icon: 'ps-circle',    category: 'face' },
  { id: 'square',   label: 'Square',     icon: 'ps-square',    category: 'face' },
  { id: 'triangle', label: 'Triangle',   icon: 'ps-triangle',  category: 'face' },
  { id: 'l1',       label: 'L1 Bumper',  icon: 'ps-l1',        category: 'shoulder' },
  { id: 'r1',       label: 'R1 Bumper',  icon: 'ps-r1',        category: 'shoulder' },
  { id: 'l2',       label: 'L2 Trigger', icon: 'ps-l2',        category: 'trigger' },
  { id: 'r2',       label: 'R2 Trigger', icon: 'ps-r2',        category: 'trigger' },
  { id: 'share',    label: 'Share',      icon: 'ps-share',     category: 'system' },
  { id: 'options',  label: 'Options',    icon: 'ps-options',   category: 'system' },
  { id: 'l3',       label: 'L3 Stick',   icon: 'ps-l3',        category: 'stick' },
  { id: 'r3',       label: 'R3 Stick',   icon: 'ps-r3',        category: 'stick' },
  { id: 'dpUp',     label: 'D-Pad Up',   icon: 'ps-dup',       category: 'dpad' },
  { id: 'dpDown',   label: 'D-Pad Down', icon: 'ps-ddown',     category: 'dpad' },
  { id: 'dpLeft',   label: 'D-Pad Left', icon: 'ps-dleft',     category: 'dpad' },
  { id: 'dpRight',  label: 'D-Pad Right',icon: 'ps-dright',    category: 'dpad' },
  { id: 'ps',       label: 'PS Button',  icon: 'ps-home',      category: 'system' },
  { id: 'touchpad', label: 'Touchpad',   icon: 'ps-touchpad',  category: 'system' },
];

const AXES: ControllerAxis[] = [
  { id: 'leftX',        label: 'Left Stick X',   category: 'stick' },
  { id: 'leftY',        label: 'Left Stick Y',   category: 'stick' },
  { id: 'rightX',       label: 'Right Stick X',  category: 'stick' },
  { id: 'rightY',       label: 'Right Stick Y',  category: 'stick' },
  { id: 'leftTrigger',  label: 'L2 Trigger',     category: 'trigger' },
  { id: 'rightTrigger', label: 'R2 Trigger',     category: 'trigger' },
];

// DualShock 4
const DS4_PIDS = ['05c4', '09cc'];

class DualShock4Controller extends BaseController {
  readonly id = 'dualshock4';
  readonly name = 'PlayStation DualShock 4';
  readonly family = 'playstation' as const;
  readonly inputApi = 'hid' as const;
  readonly vendorIds = ['054c'];
  readonly productIds = DS4_PIDS;
  readonly brandLogoKey = 'playstation';
  readonly buttonIcons = PS_ICONS;
  readonly defaultMappings = PS_MAPPINGS;
  readonly buttons = PS_BUTTONS;
  readonly axes = AXES;

  parseReport(reportId: number, data: DataView): ParsedInput | null {
    return parseDualShock4Report(reportId, data);
  }

  getStickDefaults(): StickDefaults { return SONY_STICK_DEFAULTS; }
}

// DualSense
const DUALSENSE_PIDS = ['0ce6', '0df2'];

class DualSenseController extends BaseController {
  readonly id = 'dualsense';
  readonly name = 'PlayStation DualSense';
  readonly family = 'playstation' as const;
  readonly inputApi = 'hid' as const;
  readonly vendorIds = ['054c'];
  readonly productIds = DUALSENSE_PIDS;
  readonly brandLogoKey = 'playstation';
  readonly buttonIcons = PS_ICONS;
  readonly defaultMappings = PS_MAPPINGS;
  readonly buttons: ControllerButton[] = [
    ...PS_BUTTONS,
    { id: 'mute', label: 'Mute', icon: 'ps-mute', category: 'system' },
  ];
  readonly axes = AXES;

  parseReport(reportId: number, data: DataView): ParsedInput | null {
    return parseDualSenseReport(reportId, data);
  }

  getStickDefaults(): StickDefaults { return SONY_STICK_DEFAULTS; }
}

registerController(new DualShock4Controller());
registerController(new DualSenseController());
