/* @layer shared-input @kind data */
/**
 * Nintendo SNES Controller — Switch Online (NSO). VID 0x057E / PID 0x2017.
 *
 * Wireless SNES pad for Switch Online — the classic SNES buttons plus the
 * ZL/ZR shoulders NSO added. Streams HID report 0x3F; no analog sticks.
 */

import { BaseController, type ControllerButton, type ControllerAxis, type ParsedInput } from '../../base';
import { registerController } from '../../registry';
import type { ButtonMapping, ButtonIcon } from '../../../types/controls';
import { icon, btn } from './builders';

// ── Icons (real SVG assets under public/buttons/snes/) ──

const ICONS: Record<string, ButtonIcon> = {
  'snes-b':      icon('snes-b', 'B'),
  'snes-a':      icon('snes-a', 'A'),
  'snes-y':      icon('snes-y', 'Y'),
  'snes-x':      icon('snes-x', 'X'),
  'snes-l':      icon('snes-l', 'L'),
  'snes-r':      icon('snes-r', 'R'),
  'snes-zl':     icon('snes-zl', 'ZL'),
  'snes-zr':     icon('snes-zr', 'ZR'),
  'snes-select': icon('snes-select', 'Select'),
  'snes-start':  icon('snes-start', 'Start'),
  'snes-dup':    icon('snes-dup', 'D-Pad Up'),
  'snes-ddown':  icon('snes-ddown', 'D-Pad Down'),
  'snes-dleft':  icon('snes-dleft', 'D-Pad Left'),
  'snes-dright': icon('snes-dright', 'D-Pad Right'),
};

// ── SNES Button Mappings (button index → SNES button) ──
// Indices match the parseReport() boolean[] below. ZL/ZR (6/7) are omitted —
// no SNES equivalent, so they stay unbound until the user assigns them.

const DEFAULT_MAPPINGS: ButtonMapping[] = [
  btn('B',      0,  ICONS['snes-b']),
  btn('A',      1,  ICONS['snes-a']),
  btn('Y',      2,  ICONS['snes-y']),
  btn('X',      3,  ICONS['snes-x']),
  btn('L',      4,  ICONS['snes-l']),
  btn('R',      5,  ICONS['snes-r']),
  btn('Select', 8,  ICONS['snes-select']),
  btn('Start',  9,  ICONS['snes-start']),
  btn('Up',     10, ICONS['snes-dup']),
  btn('Down',   11, ICONS['snes-ddown']),
  btn('Left',   12, ICONS['snes-dleft']),
  btn('Right',  13, ICONS['snes-dright']),
];

const BUTTONS: ControllerButton[] = [
  { id: 'b',       label: 'B Button',    icon: 'snes-b',      category: 'face' },
  { id: 'a',       label: 'A Button',    icon: 'snes-a',      category: 'face' },
  { id: 'y',       label: 'Y Button',    icon: 'snes-y',      category: 'face' },
  { id: 'x',       label: 'X Button',    icon: 'snes-x',      category: 'face' },
  { id: 'l',       label: 'L Button',    icon: 'snes-l',      category: 'shoulder' },
  { id: 'r',       label: 'R Button',    icon: 'snes-r',      category: 'shoulder' },
  { id: 'zl',      label: 'ZL Button',   icon: 'snes-zl',     category: 'trigger' },
  { id: 'zr',      label: 'ZR Button',   icon: 'snes-zr',     category: 'trigger' },
  { id: 'select',  label: 'Select',      icon: 'snes-select', category: 'system' },
  { id: 'start',   label: 'Start',       icon: 'snes-start',  category: 'system' },
  { id: 'dpUp',    label: 'D-Pad Up',    icon: 'snes-dup',    category: 'dpad' },
  { id: 'dpDown',  label: 'D-Pad Down',  icon: 'snes-ddown',  category: 'dpad' },
  { id: 'dpLeft',  label: 'D-Pad Left',  icon: 'snes-dleft',  category: 'dpad' },
  { id: 'dpRight', label: 'D-Pad Right', icon: 'snes-dright', category: 'dpad' },
];

// ── Implementation ──

class NsoSnesController extends BaseController {
  readonly id = 'nso-snes';
  readonly name = 'Nintendo SNES Controller';
  readonly family = 'nintendo' as const;
  readonly inputApi = 'hid' as const;
  readonly vendorIds = ['057e'];
  readonly productIds = ['2017'];
  readonly brandLogoKey = 'nintendo';
  readonly buttonIcons = ICONS;
  readonly defaultMappings = DEFAULT_MAPPINGS;
  readonly buttons = BUTTONS;
  readonly axes: ControllerAxis[] = [];

  /**
   * Simple mode (report 0x3F) — no sticks. byte1 = face/shoulder bits,
   * byte2 = system bits, byte3 = d-pad hat (neutral = 8).
   */
  parseReport(reportId: number, data: DataView): ParsedInput | null {
    if (reportId !== 0x3F || data.byteLength < 3) return null;

    const b0 = data.getUint8(0); // raw byte1: face + shoulders
    const b1 = data.getUint8(1); // raw byte2: Minus / Plus
    const hat = data.getUint8(2); // raw byte3: d-pad hat (0=Up … 7=Up-Left, 8=neutral)

    const dUp = hat === 0 || hat === 1 || hat === 7;
    const dRight = hat === 1 || hat === 2 || hat === 3;
    const dDown = hat === 3 || hat === 4 || hat === 5;
    const dLeft = hat === 5 || hat === 6 || hat === 7;

    const buttons: boolean[] = [
      !!(b0 & 0x01),  //  0: B
      !!(b0 & 0x02),  //  1: A
      !!(b0 & 0x04),  //  2: Y
      !!(b0 & 0x08),  //  3: X
      !!(b0 & 0x10),  //  4: L
      !!(b0 & 0x20),  //  5: R
      !!(b0 & 0x40),  //  6: ZL
      !!(b1 & 0x80),  //  7: ZR
      !!(b1 & 0x01),  //  8: Select (Minus)
      !!(b1 & 0x02),  //  9: Start  (Plus)
      dUp,            // 10: D-Pad Up
      dDown,          // 11: D-Pad Down
      dLeft,          // 12: D-Pad Left
      dRight,         // 13: D-Pad Right
    ];

    return { buttons, axes: [] };
  }
}

// ── Self-register ──
registerController(new NsoSnesController());
