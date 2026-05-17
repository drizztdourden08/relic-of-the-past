/**
 * Generic / fallback controller.
 * Matches any device not claimed by a specific implementation.
 * Uses Web Gamepad API standard mapping.
 */

import { BaseController, type ControllerButton, type ControllerAxis } from '../base';
import { registerController } from '../registry';
import type { ButtonMapping, ButtonIcon } from '../../../types/controls';

const icon = (key: string, label: string): ButtonIcon => ({ key, path: null, label });

const ICONS: Record<string, ButtonIcon> = {
  'generic-a':      icon('generic-a', '1'),
  'generic-b':      icon('generic-b', '2'),
  'generic-x':      icon('generic-x', '3'),
  'generic-y':      icon('generic-y', '4'),
  'generic-l':      icon('generic-l', 'L1'),
  'generic-r':      icon('generic-r', 'R1'),
  'generic-zl':     icon('generic-zl', 'L2'),
  'generic-zr':     icon('generic-zr', 'R2'),
  'generic-select': icon('generic-select', 'Sel'),
  'generic-start':  icon('generic-start', 'Start'),
  'generic-ls':     icon('generic-ls', 'LS'),
  'generic-rs':     icon('generic-rs', 'RS'),
  'generic-dup':    icon('generic-dup', '↑'),
  'generic-ddown':  icon('generic-ddown', '↓'),
  'generic-dleft':  icon('generic-dleft', '←'),
  'generic-dright': icon('generic-dright', '→'),
  'generic-home':   icon('generic-home', 'Home'),
};

function btn(snesButton: ButtonMapping['snesButton'], index: number, iconData: ButtonIcon | null): ButtonMapping {
  return { snesButton, binding: { type: 'gamepad-button', index }, icon: iconData };
}

const DEFAULT_MAPPINGS: ButtonMapping[] = [
  btn('B',      0,  ICONS['generic-a']),
  btn('A',      1,  ICONS['generic-b']),
  btn('Y',      2,  ICONS['generic-x']),
  btn('X',      3,  ICONS['generic-y']),
  btn('L',      4,  ICONS['generic-l']),
  btn('R',      5,  ICONS['generic-r']),
  btn('Select', 8,  ICONS['generic-select']),
  btn('Start',  9,  ICONS['generic-start']),
  btn('Up',     12, ICONS['generic-dup']),
  btn('Down',   13, ICONS['generic-ddown']),
  btn('Left',   14, ICONS['generic-dleft']),
  btn('Right',  15, ICONS['generic-dright']),
];

const BUTTONS: ControllerButton[] = [
  { id: 'a',       label: 'Button 1 (South)', icon: 'generic-a',      category: 'face' },
  { id: 'b',       label: 'Button 2 (East)',  icon: 'generic-b',      category: 'face' },
  { id: 'x',       label: 'Button 3 (West)',  icon: 'generic-x',      category: 'face' },
  { id: 'y',       label: 'Button 4 (North)', icon: 'generic-y',      category: 'face' },
  { id: 'l',       label: 'Left Bumper',      icon: 'generic-l',      category: 'shoulder' },
  { id: 'r',       label: 'Right Bumper',     icon: 'generic-r',      category: 'shoulder' },
  { id: 'zl',      label: 'Left Trigger',     icon: 'generic-zl',     category: 'trigger' },
  { id: 'zr',      label: 'Right Trigger',    icon: 'generic-zr',     category: 'trigger' },
  { id: 'plus',    label: 'Start / Menu',     icon: 'generic-start',  category: 'system' },
  { id: 'minus',   label: 'Select / Back',    icon: 'generic-select', category: 'system' },
  { id: 'lstick',  label: 'Left Stick Click', icon: 'generic-ls',     category: 'stick' },
  { id: 'rstick',  label: 'Right Stick Click',icon: 'generic-rs',     category: 'stick' },
  { id: 'dpUp',    label: 'D-Pad Up',         icon: 'generic-dup',    category: 'dpad' },
  { id: 'dpDown',  label: 'D-Pad Down',       icon: 'generic-ddown',  category: 'dpad' },
  { id: 'dpLeft',  label: 'D-Pad Left',       icon: 'generic-dleft',  category: 'dpad' },
  { id: 'dpRight', label: 'D-Pad Right',      icon: 'generic-dright', category: 'dpad' },
  { id: 'home',    label: 'Home / Guide',     icon: 'generic-home',   category: 'system' },
];

const AXES: ControllerAxis[] = [
  { id: 'leftX',  label: 'Left Stick X',  category: 'stick' },
  { id: 'leftY',  label: 'Left Stick Y',  category: 'stick' },
  { id: 'rightX', label: 'Right Stick X', category: 'stick' },
  { id: 'rightY', label: 'Right Stick Y', category: 'stick' },
];

/**
 * Generic controller — matches ANY vid:pid as a fallback.
 * Must be registered LAST so specific controllers take priority.
 */
class GenericController extends BaseController {
  readonly id = 'generic';
  readonly name = 'Generic Controller';
  readonly family = 'generic' as const;
  readonly inputApi = 'webapi' as const;
  readonly vendorIds: string[] = [];
  readonly productIds: string[] = [];
  readonly brandLogoKey = 'generic';
  readonly buttonIcons = ICONS;
  readonly defaultMappings = DEFAULT_MAPPINGS;
  readonly buttons = BUTTONS;
  readonly axes = AXES;

  /** Generic always matches as a fallback. */
  matches(_vid: string, _pid: string): boolean {
    return true;
  }
}

registerController(new GenericController());
