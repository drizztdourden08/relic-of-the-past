/* @layer shared-input @kind data */
/**
 * Nintendo Switch Pro Controller (Original)
 * VID: 0x057E  PID: 0x2009
 *
 * Features:
 * - HID input via report 0x3F (simple mode, before init) and 0x30 (full mode, after init)
 * - HID-level initialization (0x80 handshake commands + subcommand 0x03 for full report mode)
 * - Haptic vibration via HID report 0x02
 * - 12-bit analog sticks (in full mode), 8-bit (in simple mode)
 * - 17 buttons
 */

import { BaseController, type ControllerButton, type ControllerAxis, type ControllerContext, type ParsedInput, type StickDefaults } from '../../base';
import { registerController } from '../../registry';
import type { ButtonMapping, ButtonIcon } from '../../../types/controls';
import { icon, btn } from './builders';
import { parseSwitchProReport } from './switch-pro-hid';

// ── Icons ──

const ICONS: Record<string, ButtonIcon> = {
  'switch-a':      icon('switch-a', 'A Button'),
  'switch-b':      icon('switch-b', 'B Button'),
  'switch-x':      icon('switch-x', 'X Button'),
  'switch-y':      icon('switch-y', 'Y Button'),
  'switch-l':      icon('switch-l', 'L Bumper'),
  'switch-r':      icon('switch-r', 'R Bumper'),
  'switch-zl':     icon('switch-zl', 'ZL Trigger'),
  'switch-zr':     icon('switch-zr', 'ZR Trigger'),
  'switch-minus':  icon('switch-minus', 'Minus'),
  'switch-plus':   icon('switch-plus', 'Plus'),
  'switch-ls':     icon('switch-ls', 'Left Stick'),
  'switch-rs':     icon('switch-rs', 'Right Stick'),
  'switch-dup':    icon('switch-dup', 'D-Pad Up'),
  'switch-ddown':  icon('switch-ddown', 'D-Pad Down'),
  'switch-dleft':  icon('switch-dleft', 'D-Pad Left'),
  'switch-dright': icon('switch-dright', 'D-Pad Right'),
  'switch-home':   icon('switch-home', 'Home'),
  'switch-capture':icon('switch-capture', 'Capture'),
};

// ── Haptic Patterns ──

const HAPTIC_SILENT: number[] = [0x3f, 0x01, 0xf0, 0x19, 0x00];

// ── HID Init ──
// Handshake (0x80) is in base class. Only the subcmd 0x30 is controller-specific.

// ── SNES Button Mappings ──

const DEFAULT_MAPPINGS: ButtonMapping[] = [
  btn('B',      0,  ICONS['switch-b']),
  btn('A',      1,  ICONS['switch-a']),
  btn('Y',      2,  ICONS['switch-y']),
  btn('X',      3,  ICONS['switch-x']),
  btn('L',      4,  ICONS['switch-l']),
  btn('R',      5,  ICONS['switch-r']),
  btn('Select', 8,  ICONS['switch-minus']),
  btn('Start',  9,  ICONS['switch-plus']),
  btn('Up',     12, ICONS['switch-dup']),
  btn('Down',   13, ICONS['switch-ddown']),
  btn('Left',   14, ICONS['switch-dleft']),
  btn('Right',  15, ICONS['switch-dright']),
];

// ── Implementation ──

class SwitchProController extends BaseController {
  readonly id = 'switch-pro';
  readonly name = 'Nintendo Switch Pro Controller';
  readonly family = 'nintendo' as const;
  readonly inputApi = 'hid' as const;
  readonly vendorIds = ['057e'];
  readonly productIds = ['2009'];
  readonly brandLogoKey = 'nintendo';
  readonly buttonIcons = ICONS;
  readonly defaultMappings = DEFAULT_MAPPINGS;

  readonly buttons: ControllerButton[] = [
    { id: 'b',       label: 'B Button',     icon: 'switch-b',       category: 'face' },
    { id: 'a',       label: 'A Button',     icon: 'switch-a',       category: 'face' },
    { id: 'y',       label: 'Y Button',     icon: 'switch-y',       category: 'face' },
    { id: 'x',       label: 'X Button',     icon: 'switch-x',       category: 'face' },
    { id: 'l',       label: 'L Bumper',     icon: 'switch-l',       category: 'shoulder' },
    { id: 'r',       label: 'R Bumper',     icon: 'switch-r',       category: 'shoulder' },
    { id: 'zl',      label: 'ZL Trigger',   icon: 'switch-zl',      category: 'trigger' },
    { id: 'zr',      label: 'ZR Trigger',   icon: 'switch-zr',      category: 'trigger' },
    { id: 'minus',   label: 'Minus',        icon: 'switch-minus',   category: 'system' },
    { id: 'plus',    label: 'Plus',         icon: 'switch-plus',    category: 'system' },
    { id: 'lstick',  label: 'L Stick',      icon: 'switch-ls',      category: 'stick' },
    { id: 'rstick',  label: 'R Stick',      icon: 'switch-rs',      category: 'stick' },
    { id: 'dpUp',    label: 'D-Pad Up',     icon: 'switch-dup',     category: 'dpad' },
    { id: 'dpDown',  label: 'D-Pad Down',   icon: 'switch-ddown',   category: 'dpad' },
    { id: 'dpLeft',  label: 'D-Pad Left',   icon: 'switch-dleft',   category: 'dpad' },
    { id: 'dpRight', label: 'D-Pad Right',  icon: 'switch-dright',  category: 'dpad' },
    { id: 'home',    label: 'Home',         icon: 'switch-home',    category: 'system' },
    { id: 'capture', label: 'Capture',      icon: 'switch-capture', category: 'system' },
  ];

  readonly axes: ControllerAxis[] = [
    { id: 'leftX',  label: 'Left Stick X',  category: 'stick' },
    { id: 'leftY',  label: 'Left Stick Y',  category: 'stick' },
    { id: 'rightX', label: 'Right Stick X', category: 'stick' },
    { id: 'rightY', label: 'Right Stick Y', category: 'stick' },
  ];

  private initDone = new Set<string>();

  // ── HID Report Parsing ──

  parseReport(reportId: number, data: DataView): ParsedInput | null {
    return parseSwitchProReport(reportId, data);
  }

  // ── Lifecycle ──

  async init(ctx: ControllerContext): Promise<void> {
    if (this.initDone.has(ctx.deviceKey)) return;

    // Shared Nintendo USB handshake (0x80 commands)
    await this.sendUsbHandshake(ctx);

    // Switch Pro needs subcmd to enter full report mode (0x30)
    const subcmd = [0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x30];
    const buf = new Array(64).fill(0);
    for (let i = 0; i < subcmd.length; i++) buf[i] = subcmd[i];
    const ok = await ctx.hidWrite(buf);
    ctx.log(`Switch Pro: ${ok ? '✓' : '✗'} SubCmd: mode=full`);
    await ctx.delay(50);

    this.initDone.add(ctx.deviceKey);
    ctx.log('Switch Pro: Init complete');
  }

  async cleanup(ctx: ControllerContext): Promise<void> {
    const buf = this.buildHapticFrame(HAPTIC_SILENT, 0);
    await ctx.hidWrite(buf);
    this.initDone.delete(ctx.deviceKey);
    ctx.log('Switch Pro: Cleanup done');
  }

  async reset(ctx: ControllerContext): Promise<void> {
    this.initDone.delete(ctx.deviceKey);
    await this.init(ctx);
  }

  // ── Haptics ──

  supportsVibration(): boolean { return true; }

  // ── Stick Defaults ──

  getStickDefaults(): StickDefaults {
    return {
      encoding: '12bit-packed',
      center: 2048,
      range: 2048,
      innerDeadzone: 0.05,
      outerDeadzone: 0.95,
    };
  }

  // ── Private Helpers ──

  private buildHapticFrame(hapticData: number[], counter: number): number[] {
    const buf = new Array(64).fill(0);
    buf[0] = 0x02;
    buf[1] = 0x50 | (counter & 0x0F);
    buf[17] = buf[1];
    for (let i = 0; i < hapticData.length; i++) {
      buf[2 + i] = hapticData[i];
      buf[18 + i] = hapticData[i];
    }
    return buf;
  }
}

// ── Self-register ──
registerController(new SwitchProController());
