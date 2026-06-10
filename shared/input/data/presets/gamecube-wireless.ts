/* @layer shared-input @kind data */
/**
 * Nintendo GameCube Wireless Controller
 * VID: 0x057E  PID: 0x2073
 *
 * The newer standalone wireless GameCube controller for Nintendo Switch.
 * Uses the standard Switch controller HID protocol (reports 0x3F simple, 0x30 full).
 *
 * Layout:
 * - Face: A, B, X, Y (classic GameCube arrangement)
 * - Shoulder: L, R (digital bumpers)
 * - Trigger: ZL, ZR (digital triggers)
 * - System: +, -, Home, Capture
 * - D-Pad: Up, Down, Left, Right
 * - Left analog stick
 * - C-Stick (right analog stick)
 * - NO stick click buttons (no L3/R3)
 */

import { BaseController, type ControllerButton, type ControllerAxis, type ControllerContext, type ParsedInput, type StickDefaults, type VibrationSegment } from '../../base';
import { registerController } from '../../registry';
import type { ButtonMapping, ButtonIcon } from '../../../types/controls';
import { icon, btn, axis } from './builders';

// ── Helpers ──

const normalizeStick8 = (val: number, center: number, min: number, max: number): number => {
  if (val <= center) return Math.max(-1, (val - center) / (center - min));
  return Math.min(1, (val - center) / (max - center));
};

const normalizeStick12 = (val: number, center: number, range: number): number => {
  return Math.max(-1, Math.min(1, (val - center) / Math.max(range, 1)));
};

const applyDeadzone = (value: number, deadzone: number): number => {
  if (deadzone <= 0) return value;
  const mag = Math.abs(value);
  if (mag < deadzone) return 0;
  const scaled = (mag - deadzone) / (1 - deadzone);
  return Math.min(1, Math.max(-1, value > 0 ? scaled : -scaled));
};

// ── Icons ──

const ICONS: Record<string, ButtonIcon> = {
  'gc-a':      icon('gc-a', 'A Button'),
  'gc-b':      icon('gc-b', 'B Button'),
  'gc-x':      icon('gc-x', 'X Button'),
  'gc-y':      icon('gc-y', 'Y Button'),
  'gc-l':      icon('gc-l', 'L Trigger'),
  'gc-r':      icon('gc-r', 'R Trigger'),
  'gc-zl':     icon('gc-zl', 'ZL Trigger'),
  'gc-zr':     icon('gc-zr', 'ZR Trigger'),
  'gc-start':  icon('gc-start', 'Start'),
  'gc-chat':   icon('gc-chat', 'Chat'),
  'gc-dup':    icon('gc-dup', 'D-Pad Up'),
  'gc-ddown':  icon('gc-ddown', 'D-Pad Down'),
  'gc-dleft':  icon('gc-dleft', 'D-Pad Left'),
  'gc-dright': icon('gc-dright', 'D-Pad Right'),
  'gc-home':   icon('gc-home', 'Home'),
  'gc-capture':icon('gc-capture', 'Capture'),
  'gc-stick-l-up':    icon('gc-stick-l-up', 'Stick Up'),
  'gc-stick-l-down':  icon('gc-stick-l-down', 'Stick Down'),
  'gc-stick-l-left':  icon('gc-stick-l-left', 'Stick Left'),
  'gc-stick-l-right': icon('gc-stick-l-right', 'Stick Right'),
};

// ── Haptic Patterns ──

const HAPTIC_STRONG: number[] = [0x93, 0x35, 0x36, 0x1c, 0x0d];
const HAPTIC_MEDIUM: number[] = [0x75, 0x19, 0x41, 0x9b, 0x03];
const HAPTIC_LIGHT:  number[] = [0x48, 0x71, 0x20, 0x5a, 0x02];
const HAPTIC_SILENT: number[] = [0x3f, 0x01, 0xf0, 0x19, 0x00];

// ── SNES Button Mappings ──

const DEFAULT_MAPPINGS: ButtonMapping[] = [
  btn('B',      1,  ICONS['gc-b']),
  btn('A',      0,  ICONS['gc-a']),
  btn('Y',      3,  ICONS['gc-y']),
  btn('X',      2,  ICONS['gc-x']),
  btn('L',      4,  ICONS['gc-l']),
  btn('R',      5,  ICONS['gc-r']),
  btn('Select', 9,  ICONS['gc-chat']),
  btn('Start',  8,  ICONS['gc-start']),
  // Left stick for movement
  axis('Up',    1, '-', ICONS['gc-stick-l-up']),
  axis('Down',  1, '+', ICONS['gc-stick-l-down']),
  axis('Left',  0, '-', ICONS['gc-stick-l-left']),
  axis('Right', 0, '+', ICONS['gc-stick-l-right']),
];

// ── Implementation ──

class GameCubeWirelessController extends BaseController {
  readonly id = 'gamecube-wireless';
  readonly name = 'Nintendo GameCube Wireless Controller';
  readonly family = 'nintendo' as const;
  readonly inputApi = 'hid' as const;
  readonly vendorIds = ['057e'];
  readonly productIds = ['2073'];
  readonly brandLogoKey = 'nintendo';
  readonly buttonIcons = ICONS;
  readonly defaultMappings = DEFAULT_MAPPINGS;

  readonly buttons: ControllerButton[] = [
    { id: 'a',       label: 'A Button',     icon: 'gc-a',       category: 'face' },
    { id: 'b',       label: 'B Button',     icon: 'gc-b',       category: 'face' },
    { id: 'x',       label: 'X Button',     icon: 'gc-x',       category: 'face' },
    { id: 'y',       label: 'Y Button',     icon: 'gc-y',       category: 'face' },
    { id: 'l',       label: 'L Trigger',    icon: 'gc-l',       category: 'shoulder' },
    { id: 'r',       label: 'R Trigger',    icon: 'gc-r',       category: 'shoulder' },
    { id: 'zl',      label: 'ZL Bumper',   icon: 'gc-zl',      category: 'shoulder' },
    { id: 'zr',      label: 'ZR Bumper',   icon: 'gc-zr',      category: 'shoulder' },
    { id: 'start',   label: 'Start',        icon: 'gc-start',   category: 'system' },
    { id: 'chat',    label: 'Chat',         icon: 'gc-chat',    category: 'system' },
    { id: 'dpUp',    label: 'D-Pad Up',     icon: 'gc-dup',     category: 'dpad' },
    { id: 'dpDown',  label: 'D-Pad Down',   icon: 'gc-ddown',   category: 'dpad' },
    { id: 'dpLeft',  label: 'D-Pad Left',   icon: 'gc-dleft',   category: 'dpad' },
    { id: 'dpRight', label: 'D-Pad Right',  icon: 'gc-dright',  category: 'dpad' },
    { id: 'home',    label: 'Home',         icon: 'gc-home',    category: 'system' },
    { id: 'capture', label: 'Capture',      icon: 'gc-capture', category: 'system' },
  ];

  readonly axes: ControllerAxis[] = [
    { id: 'leftX',        label: 'Left Stick X',   category: 'stick' },
    { id: 'leftY',        label: 'Left Stick Y',   category: 'stick' },
    { id: 'rightX',       label: 'C-Stick X',      category: 'stick' },
    { id: 'rightY',       label: 'C-Stick Y',      category: 'stick' },
    { id: 'leftTrigger',  label: 'L Trigger',      category: 'trigger' },
    { id: 'rightTrigger', label: 'R Trigger',      category: 'trigger' },
  ];

  // ── HID Report Parsing ──

  parseReport(reportId: number, data: DataView): ParsedInput | null {
    if (reportId === 0x05 && data.byteLength >= 16) {
      return this.parseUSB(data);
    }
    if (reportId === 0x0A && data.byteLength >= 14) {
      return this.parseReport0A(data);
    }
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
   * USB mode (report 0x05) — 12-bit packed sticks, standard Switch button format.
   * Active after USB handshake (0x80 0x04).
   *
   * Byte layout (DataView offsets, after report ID byte):
   *   0-3: Header (timer, status — bytes 1-3 change at idle)
   *   4: Buttons byte 0 (right): Y(0x01) X(0x02) B(0x04) A(0x08) R(0x40) ZR(0x80)
   *   5: Buttons byte 1 (shared): Chat(0x01) Start(0x02) Home(0x10) Capture(0x20)
   *   6: Buttons byte 2 (left): Down(0x01) Up(0x02) Right(0x04) Left(0x08) L(0x40) ZL(0x80)
   *   7-9: Unknown (stable, possibly unused)
   *  10-15: Sticks packed 12-bit (LX, LY, RX, RY) — 6 bytes for 4 axes
   *     LX = byte10 | ((byte11 & 0x0F) << 8)
   *     LY = (byte11 >> 4) | (byte12 << 4)
   *     RX = byte13 | ((byte14 & 0x0F) << 8)
   *     RY = (byte14 >> 4) | (byte15 << 4)
   *  60: Left trigger  (8-bit, rest ~32, max ~230)
   *  61: Right trigger (8-bit, rest ~32, max ~230)
   *  16-59,62+: IMU/extension data
   */
  private parseUSB(data: DataView): ParsedInput {
    const b0 = data.getUint8(4);
    const b1 = data.getUint8(5);
    const b2 = data.getUint8(6);

    // 12-bit packed sticks (0-4095, center ~2048)
    const s10 = data.getUint8(10);
    const s11 = data.getUint8(11);
    const s12 = data.getUint8(12);
    const s13 = data.getUint8(13);
    const s14 = data.getUint8(14);
    const s15 = data.getUint8(15);

    const lx = s10 | ((s11 & 0x0F) << 8);
    const ly = (s11 >> 4) | (s12 << 4);
    const rx = s13 | ((s14 & 0x0F) << 8);
    const ry = (s14 >> 4) | (s15 << 4);

    const buttons: boolean[] = [
      !!(b0 & 0x08),  //  0: A
      !!(b0 & 0x04),  //  1: B
      !!(b0 & 0x02),  //  2: X
      !!(b0 & 0x01),  //  3: Y
      !!(b2 & 0x40),  //  4: L (digital click)
      !!(b0 & 0x40),  //  5: R (digital click)
      !!(b2 & 0x80),  //  6: ZL
      !!(b0 & 0x80),  //  7: ZR
      !!(b1 & 0x02),  //  8: Start
      !!(b1 & 0x40),  //  9: Chat
      !!(b2 & 0x02),  // 10: DPad Up
      !!(b2 & 0x01),  // 11: DPad Down
      !!(b2 & 0x08),  // 12: DPad Left
      !!(b2 & 0x04),  // 13: DPad Right
      !!(b1 & 0x10),  // 14: Home
      !!(b1 & 0x20),  // 15: Capture
    ];

    // Normalize 12-bit sticks (center 2048, physical range ~1200) + 5% scaled deadzone
    const DZ = 0.05;
    const RANGE = 1200; // Physical stick travel is ~±1200 from center, not full 2048
    const axes: number[] = [
      applyDeadzone(normalizeStick12(lx, 2048, RANGE), DZ),   // Left stick X
      -applyDeadzone(normalizeStick12(ly, 2048, RANGE), DZ),  // Left stick Y (negated: Nintendo Y-up convention)
      applyDeadzone(normalizeStick12(rx, 2048, RANGE), DZ),   // C-Stick X
      -applyDeadzone(normalizeStick12(ry, 2048, RANGE), DZ),  // C-Stick Y (negated)
      Math.max(0, Math.min(1, (data.getUint8(60) - 32) / (230 - 32))),  // Left trigger analog (byte 61)
      Math.max(0, Math.min(1, (data.getUint8(61) - 32) / (230 - 32))),  // Right trigger analog (byte 62)
    ];

    return { buttons, axes, rawSticks: [lx, ly, rx, ry] };
  }

  /**
   * Report 0x0A — alternate USB HID mode (after USB init 0x03 command).
   * Same byte layout as Switch Pro Controller 2's report 0x09.
   *
   * Byte layout (DataView offsets, after report ID byte):
   *   0: Timer    1: Battery
   *   2: Buttons byte 0: B(0x01) A(0x02) Y(0x04) X(0x08) R(0x10) ZR(0x20) Start(0x40)
   *   3: Buttons byte 1: DpDn(0x01) DpRt(0x02) DpLt(0x04) DpUp(0x08) L(0x10) ZL(0x20) Chat(0x40)
   *   4: Buttons byte 2: Home(0x01) Capture(0x02) GR(0x04) GL(0x08)
   *   5-7: Left stick (12-bit packed)
   *   8-10: C-Stick (12-bit packed)
   *  11: Unknown
   *  12: Left trigger  (8-bit, rest ~32, max ~230)
   *  13: Right trigger (8-bit, rest ~32, max ~230)
   */
  private parseReport0A(data: DataView): ParsedInput {
    const b0 = data.getUint8(2);
    const b1 = data.getUint8(3);
    const b2 = data.getUint8(4);

    const lxRaw = data.getUint8(5) | ((data.getUint8(6) & 0x0F) << 8);
    const lyRaw = (data.getUint8(6) >> 4) | (data.getUint8(7) << 4);
    const rxRaw = data.getUint8(8) | ((data.getUint8(9) & 0x0F) << 8);
    const ryRaw = (data.getUint8(9) >> 4) | (data.getUint8(10) << 4);

    const buttons: boolean[] = [
      !!(b0 & 0x02),  //  0: A
      !!(b0 & 0x01),  //  1: B
      !!(b0 & 0x08),  //  2: X
      !!(b0 & 0x04),  //  3: Y
      !!(b1 & 0x10),  //  4: L
      !!(b0 & 0x10),  //  5: R
      !!(b1 & 0x20),  //  6: ZL
      !!(b0 & 0x20),  //  7: ZR
      !!(b0 & 0x40),  //  8: Start
      !!(b1 & 0x40),  //  9: Chat
      !!(b1 & 0x08),  // 10: DPad Up
      !!(b1 & 0x01),  // 11: DPad Down
      !!(b1 & 0x04),  // 12: DPad Left
      !!(b1 & 0x02),  // 13: DPad Right
      !!(b2 & 0x01),  // 14: Home
      !!(b2 & 0x02),  // 15: Capture
    ];

    const DZ = 0.05;
    const RANGE = 750; // 0x0a mode has ~±750 raw units of physical stick travel (vs 1200 in 0x05 mode)
    const axes: number[] = [
      applyDeadzone(normalizeStick12(lxRaw, 2048, RANGE), DZ),
      -applyDeadzone(normalizeStick12(lyRaw, 2048, RANGE), DZ),
      applyDeadzone(normalizeStick12(rxRaw, 2048, RANGE), DZ),
      -applyDeadzone(normalizeStick12(ryRaw, 2048, RANGE), DZ),
      Math.max(0, Math.min(1, (data.getUint8(12) - 32) / (230 - 32))),  // Left trigger analog
      Math.max(0, Math.min(1, (data.getUint8(13) - 32) / (230 - 32))),  // Right trigger analog
    ];

    return { buttons, axes, rawSticks: [lxRaw, lyRaw, rxRaw, ryRaw] };
  }

  /**
   * Simple mode (report 0x3F) — 8-bit sticks, hat-switch dpad.
   * Default mode before init sequence is sent.
   *
   * Byte layout (same as Switch Pro Controller):
   *   0: Buttons byte 0: B(0x01) A(0x02) Y(0x04) X(0x08) L(0x10) R(0x20) ZL(0x40) ZR(0x80)
   *   1: Buttons byte 1: Minus(0x01) Plus(0x02) Home(0x10) Capture(0x20)
   *   2: Hat switch (0-7 for dpad, 8 = centered)
   *   3: Left stick X (0-255, center 128)
   *   4: Left stick Y (0-255, center 128)
   *   5: C-Stick X (0-255, center 128)
   *   6: C-Stick Y (0-255, center 128)
   *
   * No stick click buttons on this controller.
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

    // Button order matches buttons[] property: a,b,x,y,l,r,zl,zr,start,chat,dpad,home,capture
    const buttons: boolean[] = [
      !!(b0 & 0x02),  //  0: A
      !!(b0 & 0x01),  //  1: B
      !!(b0 & 0x08),  //  2: X
      !!(b0 & 0x04),  //  3: Y
      !!(b0 & 0x10),  //  4: L
      !!(b0 & 0x20),  //  5: R
      !!(b0 & 0x40),  //  6: ZL
      !!(b0 & 0x80),  //  7: ZR
      !!(b1 & 0x02),  //  8: Start (+)
      !!(b1 & 0x01),  //  9: Chat (-)
      dUp,            // 10: DPad Up
      dDown,          // 11: DPad Down
      dLeft,          // 12: DPad Left
      dRight,         // 13: DPad Right
      !!(b1 & 0x10),  // 14: Home
      !!(b1 & 0x20),  // 15: Capture
    ];

    const axes: number[] = [
      (lx - 128) / 128,
      (ly - 128) / 128,
      (rx - 128) / 128,
      (ry - 128) / 128,
      buttons[6] ? 1 : 0,  // Left trigger (digital ZL)
      buttons[7] ? 1 : 0,  // Right trigger (digital ZR)
    ];

    return { buttons, axes, rawSticks: [lx, ly, rx, ry] };
  }

  /**
   * Full mode (report 0x30/0x21/0x31) — 12-bit sticks, 3-byte button data.
   * Active after init sequence is sent.
   *
   * Standard Nintendo Switch input report:
   *   [0]: Timer  [1]: Battery/connection
   *   [2] (byte0 - right): Y(0x01) X(0x02) B(0x04) A(0x08) R(0x40) ZR(0x80)
   *   [3] (byte1 - shared): Minus(0x01) Plus(0x02) Home(0x10) Capture(0x20)
   *   [4] (byte2 - left):   Down(0x01) Up(0x02) Right(0x04) Left(0x08) L(0x40) ZL(0x80)
   *   [5-7]: Left stick (12-bit packed)
   *   [8-10]: C-Stick (12-bit packed)
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
      !!(b0 & 0x08),  //  0: A
      !!(b0 & 0x04),  //  1: B
      !!(b0 & 0x02),  //  2: X
      !!(b0 & 0x01),  //  3: Y
      !!(b2 & 0x40),  //  4: L
      !!(b0 & 0x40),  //  5: R
      !!(b2 & 0x80),  //  6: ZL
      !!(b0 & 0x80),  //  7: ZR
      !!(b1 & 0x02),  //  8: Start
      !!(b1 & 0x40),  //  9: Chat
      !!(b2 & 0x02),  // 10: DPad Up
      !!(b2 & 0x01),  // 11: DPad Down
      !!(b2 & 0x08),  // 12: DPad Left
      !!(b2 & 0x04),  // 13: DPad Right
      !!(b1 & 0x10),  // 14: Home
      !!(b1 & 0x20),  // 15: Capture
    ];

    const axes: number[] = [
      (lxRaw - 2048) / 2048,
      -(lyRaw - 2048) / 2048,
      (rxRaw - 2048) / 2048,
      -(ryRaw - 2048) / 2048,
      buttons[6] ? 1 : 0,  // Left trigger (digital ZL)
      buttons[7] ? 1 : 0,  // Right trigger (digital ZR)
    ];

    return { buttons, axes, rawSticks: [lxRaw, lyRaw, rxRaw, ryRaw] };
  }

  // ── Lifecycle ──

  private initDone = new Set<string>();

  async init(ctx: ControllerContext): Promise<void> {
    if (this.initDone.has(ctx.deviceKey)) return;
    // USB handshake only — do NOT send subcmd 0x03/0x30 (breaks stick calibration)
    await this.sendUsbHandshake(ctx);
    this.initDone.add(ctx.deviceKey);
    ctx.log('GC Wireless: Init complete (handshake only, native 0x05 mode)');
  }

  async cleanup(ctx: ControllerContext): Promise<void> {
    const buf = this.buildHapticFrame(HAPTIC_SILENT, 0);
    await ctx.hidWrite(buf);
    this.initDone.delete(ctx.deviceKey);
    ctx.log('GC Wireless: Cleanup done');
  }

  async reset(ctx: ControllerContext): Promise<void> {
    this.initDone.delete(ctx.deviceKey);
    await this.init(ctx);
  }

  // ── Haptics ──

  supportsVibration(): boolean { return false; }

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
    const silentBuf = this.buildHapticFrame(HAPTIC_SILENT, counter);
    await ctx.hidWrite(silentBuf);

    return errors === 0
      ? { ok: true }
      : { ok: false, error: `${errors} HID write(s) failed` };
  }

  private buildHapticFrame(pattern: number[], counter: number): number[] {
    // Report 0x10: rumble only (same format as Switch Pro)
    const buf = new Array(64).fill(0);
    buf[0] = 0x10;
    buf[1] = counter & 0x0F;
    // Left motor
    buf[2] = pattern[0]; buf[3] = pattern[1]; buf[4] = pattern[2]; buf[5] = pattern[3];
    // Right motor
    buf[6] = pattern[0]; buf[7] = pattern[1]; buf[8] = pattern[2]; buf[9] = pattern[3];
    return buf;
  }

  // ── Stick Defaults ──

  getStickDefaults(): StickDefaults | null {
    return {
      encoding: '8bit-centered',
      center: 128,
      range: 120,
      innerDeadzone: 8,
      outerDeadzone: 5,
    };
  }
}

registerController(new GameCubeWirelessController());
