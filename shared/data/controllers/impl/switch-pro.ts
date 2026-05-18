/**
 * Nintendo Switch Pro Controller (Original)
 * VID: 0x057E  PID: 0x2009
 *
 * Features:
 * - HID input via report 0x3F (simple mode, before init) and 0x30 (full mode, after init)
 * - HID-level initialization (0x80 handshake commands + subcommand 0x03 for full report mode)
 * - Haptic vibration via HID report 0x02 (same format as SPC2)
 * - 12-bit analog sticks (in full mode), 8-bit (in simple mode)
 * - 17 buttons
 */

import { BaseController, type ControllerButton, type ControllerAxis, type ControllerContext, type ParsedInput, type StickDefaults, type VibrationSegment } from '../base';
import { registerController } from '../registry';
import type { ButtonMapping, ButtonIcon } from '../../../types/controls';

// ── Icons ──

const icon = (key: string, label: string): ButtonIcon => ({ key, path: null, label });

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

// ── Haptic Patterns (same as SPC2 — same hardware vibration motor format) ──

const HAPTIC_STRONG: number[] = [0x93, 0x35, 0x36, 0x1c, 0x0d];
const HAPTIC_MEDIUM: number[] = [0x75, 0x19, 0x41, 0x9b, 0x03];
const HAPTIC_LIGHT:  number[] = [0x48, 0x71, 0x20, 0x5a, 0x02];
const HAPTIC_SILENT: number[] = [0x3f, 0x01, 0xf0, 0x19, 0x00];

// ── HID Init ──
// Handshake (0x80) is in base class. Only the subcmd 0x30 is controller-specific.

// ── SNES Button Mappings ──

function btn(snesButton: ButtonMapping['snesButton'], index: number, iconData: ButtonIcon | null): ButtonMapping {
  return { snesButton, binding: { type: 'gamepad-button', index }, icon: iconData };
}

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
    { id: 'a',       label: 'A Button',     icon: 'switch-a',       category: 'face' },
    { id: 'b',       label: 'B Button',     icon: 'switch-b',       category: 'face' },
    { id: 'x',       label: 'X Button',     icon: 'switch-x',       category: 'face' },
    { id: 'y',       label: 'Y Button',     icon: 'switch-y',       category: 'face' },
    { id: 'l',       label: 'L Bumper',     icon: 'switch-l',       category: 'shoulder' },
    { id: 'r',       label: 'R Bumper',     icon: 'switch-r',       category: 'shoulder' },
    { id: 'zl',      label: 'ZL Trigger',   icon: 'switch-zl',      category: 'trigger' },
    { id: 'zr',      label: 'ZR Trigger',   icon: 'switch-zr',      category: 'trigger' },
    { id: 'plus',    label: 'Plus',         icon: 'switch-plus',    category: 'system' },
    { id: 'minus',   label: 'Minus',        icon: 'switch-minus',   category: 'system' },
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
    if (reportId === 0x3F && data.byteLength >= 7) {
      return this.parseSimple(data);
    }
    if (reportId === 0x30 && data.byteLength >= 11) {
      return this.parseFull(data);
    }
    if ((reportId === 0x21 || reportId === 0x31) && data.byteLength >= 11) {
      return this.parseFull(data);
    }
    return null;
  }

  /**
   * Simple mode (report 0x3F) — 8-bit sticks, hat-switch dpad.
   * Default USB mode before init sequence is sent.
   */
  private parseSimple(data: DataView): ParsedInput {
    const b0 = data.getUint8(0);
    const b1 = data.getUint8(1);
    const hat = data.getUint8(2);

    const lx = data.byteLength > 3 ? data.getUint8(3) : 128;
    const ly = data.byteLength > 4 ? data.getUint8(4) : 128;
    const rx = data.byteLength > 5 ? data.getUint8(5) : 128;
    const ry = data.byteLength > 6 ? data.getUint8(6) : 128;

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
      !!(b0 & 0x80),  //  7: ZR
      !!(b1 & 0x01),  //  8: Minus
      !!(b1 & 0x02),  //  9: Plus
      !!(b1 & 0x04),  // 10: L Stick
      !!(b1 & 0x08),  // 11: R Stick
      dUp,            // 12: DPad Up
      dDown,          // 13: DPad Down
      dLeft,          // 14: DPad Left
      dRight,         // 15: DPad Right
      !!(b1 & 0x10),  // 16: Home
    ];

    const axes: number[] = [
      (lx - 128) / 128,
      (ly - 128) / 128,
      (rx - 128) / 128,
      (ry - 128) / 128,
    ];

    return { buttons, axes, rawSticks: [lx, ly, rx, ry] };
  }

  /**
   * Full mode (report 0x30/0x21/0x31) — 12-bit sticks, 3-byte button data.
   * Active after USB init sequence is sent.
   */
  private parseFull(data: DataView): ParsedInput {
    const offset = 2; // skip timer + battery
    const b0 = data.getUint8(offset);
    const b1 = data.getUint8(offset + 1);
    const b2 = data.getUint8(offset + 2);

    const lxRaw = data.getUint8(offset + 3) | ((data.getUint8(offset + 4) & 0x0F) << 8);
    const lyRaw = (data.getUint8(offset + 4) >> 4) | (data.getUint8(offset + 5) << 4);
    const rxRaw = data.getUint8(offset + 6) | ((data.getUint8(offset + 7) & 0x0F) << 8);
    const ryRaw = (data.getUint8(offset + 7) >> 4) | (data.getUint8(offset + 8) << 4);

    const buttons: boolean[] = [
      !!(b0 & 0x04),  //  0: B
      !!(b0 & 0x08),  //  1: A
      !!(b0 & 0x01),  //  2: Y
      !!(b0 & 0x02),  //  3: X
      !!(b0 & 0x40),  //  4: L
      !!(b0 & 0x80),  //  5: R
      !!(b1 & 0x40),  //  6: ZL
      !!(b1 & 0x80),  //  7: ZR
      !!(b1 & 0x01),  //  8: Minus
      !!(b1 & 0x02),  //  9: Plus
      !!(b1 & 0x04),  // 10: L Stick
      !!(b1 & 0x08),  // 11: R Stick
      !!(b2 & 0x02),  // 12: DPad Up
      !!(b2 & 0x01),  // 13: DPad Down
      !!(b2 & 0x08),  // 14: DPad Left
      !!(b2 & 0x04),  // 15: DPad Right
      !!(b1 & 0x10),  // 16: Home
    ];

    const axes: number[] = [
      (lxRaw - 2048) / 2048,
      -(lyRaw - 2048) / 2048,
      (rxRaw - 2048) / 2048,
      -(ryRaw - 2048) / 2048,
    ];

    return { buttons, axes, rawSticks: [lxRaw, lyRaw, rxRaw, ryRaw] };
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

  async vibrate(ctx: ControllerContext, pattern: VibrationSegment[], gapMs: number = 0): Promise<{ ok: boolean; error?: string }> {
    const segments: { haptic: number[]; frames: number }[] = [];
    for (const seg of pattern) {
      const clamped = Math.max(0, Math.min(1, seg.intensity));
      const haptic = clamped >= 0.7 ? HAPTIC_STRONG
        : clamped >= 0.3 ? HAPTIC_MEDIUM
        : HAPTIC_LIGHT;
      segments.push({ haptic, frames: Math.max(1, Math.ceil(seg.durationMs / 4)) });
    }

    const gapFrames = Math.max(0, Math.ceil(gapMs / 4));
    let counter = 0;
    let errors = 0;

    for (let s = 0; s < segments.length; s++) {
      const { haptic, frames } = segments[s];
      for (let i = 0; i < frames; i++) {
        const buf = this.buildHapticFrame(haptic, counter);
        const ok = await ctx.hidWrite(buf);
        if (!ok) errors++;
        counter = (counter + 1) & 0x0F;
      }
      if (gapFrames > 0 && s < segments.length - 1) {
        for (let i = 0; i < gapFrames; i++) {
          const buf = this.buildHapticFrame(HAPTIC_SILENT, counter);
          const ok = await ctx.hidWrite(buf);
          if (!ok) errors++;
          counter = (counter + 1) & 0x0F;
        }
      }
    }

    // End with silence
    const ok = await ctx.hidWrite(this.buildHapticFrame(HAPTIC_SILENT, counter));
    if (!ok) errors++;

    if (errors > 0) {
      return { ok: false, error: `${errors} frame write(s) failed` };
    }
    return { ok: true };
  }

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
