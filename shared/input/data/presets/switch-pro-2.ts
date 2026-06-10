/* @layer shared-input @kind data */
/**
 * Nintendo Switch Pro Controller 2 (SPC2)
 * VID: 0x057E  PID: 0x2069
 *
 * Features:
 * - HID input via report 0x05 (USB mode) and 0x09 (alternate USB mode)
 * - USB bulk initialization required on Interface 1 before haptics work
 * - Haptic vibration via HID report 0x02
 * - 12-bit analog sticks
 * - 21 buttons including grip buttons (GL/GR) and C button
 */

import { BaseController, type ControllerButton, type ControllerAxis, type ControllerContext, type ParsedInput, type StickDefaults, type VibrationSegment } from '../../base';
import { registerController } from '../../registry';
import type { ButtonMapping, ButtonIcon } from '../../../types/controls';
import { icon, btn, axis } from './builders';

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
  'switch-c':      icon('switch-c', 'C Button'),
  'switch-gl':     icon('switch-gl', 'GL'),
  'switch-gr':     icon('switch-gr', 'GR'),
  'switch-stick-l-up':    icon('switch-stick-l-up', 'Stick Up'),
  'switch-stick-l-down':  icon('switch-stick-l-down', 'Stick Down'),
  'switch-stick-l-left':  icon('switch-stick-l-left', 'Stick Left'),
  'switch-stick-l-right': icon('switch-stick-l-right', 'Stick Right'),
};

// ── USB Init Commands (bulk OUT on Interface 1) ──
// Full initialization sequence from procon2tool (handheldlegend.github.io/procon2tool)

// Step 1: Starts HID output at 4ms intervals
const INIT_COMMAND_0x03 = [
  0x03, 0x91, 0x00, 0x0d, 0x00, 0x08,
  0x00, 0x00, 0x01, 0x00,
  0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
];

// Step 2: Unknown command 0x07
const CMD_0x07 = [0x07, 0x91, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00];

// Step 3: Unknown command 0x16
const CMD_0x16 = [0x16, 0x91, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00];

// Step 4: Request controller MAC (0x15 arg 0x01)
const REQUEST_MAC = [
  0x15, 0x91, 0x00, 0x01, 0x00, 0x0e,
  0x00, 0x00, 0x00, 0x02,
  0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
  0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
];

// Step 5: LTK request (0x15 arg 0x02)
const LTK_REQUEST = [
  0x15, 0x91, 0x00, 0x02, 0x00, 0x11,
  0x00, 0x00, 0x00,
  0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
  0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
  0xFF, 0xFF,
];

// Step 6: Unknown command 0x15 arg 0x03
const CMD_0x15_03 = [0x15, 0x91, 0x00, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00];

// Step 7: Unknown command 0x09
const CMD_0x09 = [
  0x09, 0x91, 0x00, 0x07, 0x00, 0x08,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];

// Step 8: IMU command 0x0C arg 0x02
const IMU_0x02 = [0x0c, 0x91, 0x00, 0x02, 0x00, 0x04, 0x00, 0x00, 0x27, 0x00, 0x00, 0x00];

// Step 9: OUT command 0x11
const CMD_0x11 = [0x11, 0x91, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00];

// Step 10: Unknown command 0x0A
const CMD_0x0A = [
  0x0a, 0x91, 0x00, 0x08, 0x00, 0x14,
  0x00, 0x00, 0x01,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0x35, 0x00, 0x46,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];

// Step 11: IMU command 0x0C arg 0x04
const IMU_0x04 = [0x0c, 0x91, 0x00, 0x04, 0x00, 0x04, 0x00, 0x00, 0x27, 0x00, 0x00, 0x00];

// Step 12: Enable haptics
const ENABLE_HAPTICS = [
  0x03, 0x91, 0x00, 0x0a, 0x00, 0x04,
  0x00, 0x00, 0x09,
  0x00, 0x00, 0x00,
];

// Step 13: OUT command 0x10
const CMD_0x10 = [0x10, 0x91, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00];

// Step 14: OUT command 0x01
const CMD_0x01 = [0x01, 0x91, 0x00, 0x0c, 0x00, 0x00, 0x00, 0x00];

// Step 15: OUT command 0x03 (alternate — different from step 1)
const CMD_0x03_ALT = [0x03, 0x91, 0x00, 0x01, 0x00, 0x00, 0x00];

// Step 16: OUT command 0x0A (alternate)
const CMD_0x0A_ALT = [0x0a, 0x91, 0x00, 0x02, 0x00, 0x04, 0x00, 0x00, 0x03, 0x00, 0x00];

// Step 17: Set player LED
const SET_PLAYER_LED = [
  0x09, 0x91, 0x00, 0x07, 0x00, 0x08,
  0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];

/** Full init sequence — sent in order with reads between each */
const INIT_SEQUENCE: number[][] = [
  INIT_COMMAND_0x03,
  CMD_0x07,
  CMD_0x16,
  REQUEST_MAC,
  LTK_REQUEST,
  CMD_0x15_03,
  CMD_0x09,
  IMU_0x02,
  CMD_0x11,
  CMD_0x0A,
  IMU_0x04,
  ENABLE_HAPTICS,
  CMD_0x10,
  CMD_0x01,
  CMD_0x03_ALT,
  CMD_0x0A_ALT,
  SET_PLAYER_LED,
];

// ── Haptic Patterns ──

const HAPTIC_STRONG: number[] = [0x93, 0x35, 0x36, 0x1c, 0x0d];
const HAPTIC_MEDIUM: number[] = [0x75, 0x19, 0x41, 0x9b, 0x03];
const HAPTIC_LIGHT:  number[] = [0x48, 0x71, 0x20, 0x5a, 0x02];
const HAPTIC_SILENT: number[] = [0x3f, 0x01, 0xf0, 0x19, 0x00];

// ── SNES Button Mappings ──

const DEFAULT_MAPPINGS: ButtonMapping[] = [
  btn('A',      0,  ICONS['switch-a']),
  btn('B',      1,  ICONS['switch-b']),
  btn('X',      2,  ICONS['switch-x']),
  btn('Y',      3,  ICONS['switch-y']),
  btn('L',      4,  ICONS['switch-l']),
  btn('R',      5,  ICONS['switch-r']),
  btn('Start',  8,  ICONS['switch-plus']),
  btn('Select', 9,  ICONS['switch-minus']),
  // Left stick for movement
  axis('Up',    1, '-', ICONS['switch-stick-l-up']),
  axis('Down',  1, '+', ICONS['switch-stick-l-down']),
  axis('Left',  0, '-', ICONS['switch-stick-l-left']),
  axis('Right', 0, '+', ICONS['switch-stick-l-right']),
];

// ── Implementation ──

class SwitchPro2Controller extends BaseController {
  readonly id = 'switch-pro-2';
  readonly name = 'Nintendo Switch Pro Controller 2';
  readonly family = 'nintendo' as const;
  readonly inputApi = 'hid' as const;
  readonly vendorIds = ['057e'];
  readonly productIds = ['2069'];
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
    { id: 'c',       label: 'C Button',     icon: 'switch-c',       category: 'system' },
    { id: 'gl',      label: 'GL',           icon: 'switch-gl',      category: 'shoulder' },
    { id: 'gr',      label: 'GR',           icon: 'switch-gr',      category: 'shoulder' },
  ];

  readonly axes: ControllerAxis[] = [
    { id: 'leftX',  label: 'Left Stick X',  category: 'stick' },
    { id: 'leftY',  label: 'Left Stick Y',  category: 'stick' },
    { id: 'rightX', label: 'Right Stick X', category: 'stick' },
    { id: 'rightY', label: 'Right Stick Y', category: 'stick' },
  ];

  // ── USB init state (per-device, tracked by the controller context owner) ──
  private usbInitDone = new Set<string>();

  // ── HID Report Parsing ──

  parseReport(reportId: number, data: DataView): ParsedInput | null {
    if (reportId === 0x05 && data.byteLength >= 16) {
      return this.parseReport05(data);
    }
    if (reportId === 0x09 && data.byteLength >= 11) {
      return this.parseReport09(data);
    }
    return null;
  }

  /**
   * Report 0x05 — primary USB HID mode.
   * Byte layout:
   *   0: Timer/counter    1: Status/battery
   *   2: Connection       3: Padding
   *   4: Right buttons: Y(0x01) X(0x02) B(0x04) A(0x08) ??(0x10) ??(0x20) R(0x40) ZR(0x80)
   *   5: Shared:        Minus(0x01) Plus(0x02) RStick(0x04) LStick(0x08) Home(0x10) Capture(0x20) C(0x40)
   *   6: Left+dpad:     GL(0x01) GR(0x02) DpRight(0x04) DpLeft(0x08) DpDown(0x10) DpUp(0x20) L(0x40) ZL(0x80)
   *   7: Grip buttons
   *   10-12: Left stick (12-bit packed)
   *   13-15: Right stick (12-bit packed)
   */
  private parseReport05(data: DataView): ParsedInput {
    const b0 = data.getUint8(4);
    const b1 = data.getUint8(5);
    const b2 = data.getUint8(6);
    const b3 = data.getUint8(7);

    const lxRaw = data.getUint8(10) | ((data.getUint8(11) & 0x0F) << 8);
    const lyRaw = (data.getUint8(11) >> 4) | (data.getUint8(12) << 4);
    const rxRaw = data.getUint8(13) | ((data.getUint8(14) & 0x0F) << 8);
    const ryRaw = (data.getUint8(14) >> 4) | (data.getUint8(15) << 4);

    // Button order: A, B, X, Y, L, R, ZL, ZR, +, -, LStick, RStick, DUp, DDn, DLt, DRt, Home, Capture, C, GL, GR
    const buttons: boolean[] = [
      !!(b0 & 0x08),  //  0: A
      !!(b0 & 0x04),  //  1: B
      !!(b0 & 0x02),  //  2: X
      !!(b0 & 0x01),  //  3: Y
      !!(b2 & 0x40),  //  4: L
      !!(b0 & 0x40),  //  5: R
      !!(b2 & 0x80),  //  6: ZL
      !!(b0 & 0x80),  //  7: ZR
      !!(b1 & 0x02),  //  8: Plus/Start
      !!(b1 & 0x01),  //  9: Minus/Select
      !!(b1 & 0x08),  // 10: L Stick
      !!(b1 & 0x04),  // 11: R Stick
      !!(b2 & 0x02),  // 12: DPad Up
      !!(b2 & 0x01),  // 13: DPad Down
      !!(b2 & 0x08),  // 14: DPad Left
      !!(b2 & 0x04),  // 15: DPad Right
      !!(b1 & 0x10),  // 16: Home
      !!(b1 & 0x20),  // 17: Capture
      !!(b1 & 0x40),  // 18: C (Chat)
      !!(b3 & 0x02),  // 19: GL
      !!(b3 & 0x01),  // 20: GR
    ];

    // Fallback normalization (calibration applied externally)
    let lx = (lxRaw - 2048) / 1000;
    let ly = -(lyRaw - 2048) / 1000;
    let rx = (rxRaw - 2048) / 1000;
    let ry = -(ryRaw - 2048) / 1000;
    const lMag = Math.sqrt(lx * lx + ly * ly);
    if (lMag > 1) { lx /= lMag; ly /= lMag; }
    const rMag = Math.sqrt(rx * rx + ry * ry);
    if (rMag > 1) { rx /= rMag; ry /= rMag; }

    return { buttons, axes: [lx, ly, rx, ry], rawSticks: [lxRaw, lyRaw, rxRaw, ryRaw] };
  }

  /**
   * Report 0x09 — alternate USB HID mode.
   * Byte layout:
   *   0: Timer    1: Battery
   *   2: Right buttons: B(0x01) A(0x02) Y(0x04) X(0x08) R(0x10) ZR(0x20) Plus(0x40) RStick(0x80)
   *   3: Left+dpad:     DpDn(0x01) DpRt(0x02) DpLt(0x04) DpUp(0x08) L(0x10) ZL(0x20) Minus(0x40) LStick(0x80)
   *   4: Extra:         Home(0x01) Capture(0x02) GR(0x04) GL(0x08) C/Chat(0x10)
   *   5-7: Left stick (12-bit packed)
   *   8-10: Right stick (12-bit packed)
   */
  private parseReport09(data: DataView): ParsedInput {
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
      !!(b0 & 0x40),  //  8: Plus/Start
      !!(b1 & 0x40),  //  9: Minus/Select
      !!(b1 & 0x80),  // 10: L Stick
      !!(b0 & 0x80),  // 11: R Stick
      !!(b1 & 0x08),  // 12: DPad Up
      !!(b1 & 0x01),  // 13: DPad Down
      !!(b1 & 0x04),  // 14: DPad Left
      !!(b1 & 0x02),  // 15: DPad Right
      !!(b2 & 0x01),  // 16: Home
      !!(b2 & 0x02),  // 17: Capture
      !!(b2 & 0x10),  // 18: C (Chat)
      !!(b2 & 0x08),  // 19: GL
      !!(b2 & 0x04),  // 20: GR
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
    if (this.usbInitDone.has(ctx.deviceKey)) return;

    ctx.log('SPC2: Starting USB bulk init (WebUSB)...');
    const vid = parseInt(this.vendorIds[0], 16);
    const pid = parseInt(this.productIds[0], 16);

    const device = await ctx.usbOpen(vid, pid);
    if (!device) {
      ctx.log('SPC2: WebUSB device not available — skipping init');
      return;
    }

    try {
      if (!device.configuration) {
        await device.selectConfiguration(1);
      }

      const USB_INTERFACE = 1;
      await device.claimInterface(USB_INTERFACE);
      ctx.log('SPC2: USB interface 1 claimed');

      const iface = device.configuration!.interfaces[USB_INTERFACE];
      const endpointOut = iface.alternate.endpoints.find(
        ep => ep.direction === 'out' && ep.type === 'bulk'
      );
      const endpointIn = iface.alternate.endpoints.find(
        ep => ep.direction === 'in' && ep.type === 'bulk'
      );
      if (!endpointOut) {
        ctx.log('SPC2: No bulk OUT endpoint found');
        return;
      }

      // Send full init sequence — write each command, read response, 10ms delay
      for (let i = 0; i < INIT_SEQUENCE.length; i++) {
        await device.transferOut(endpointOut.endpointNumber, new Uint8Array(INIT_SEQUENCE[i]));
        await ctx.delay(10);
        // Read ACK/response (32 bytes, non-critical if it fails)
        if (endpointIn) {
          try {
            await device.transferIn(endpointIn.endpointNumber, 32);
          } catch { /* some commands don't ACK — that's fine */ }
        }
      }

      ctx.log('SPC2: USB bulk init complete — full sequence sent');
      this.usbInitDone.add(ctx.deviceKey);
    } catch (e: any) {
      ctx.log(`SPC2: USB init error — ${e.message}`);
    }
    // Don't close USB device — keep alive so haptic engine stays enabled
  }

  async cleanup(ctx: ControllerContext): Promise<void> {
    // Send SILENT haptic frame to stop any running vibration
    const silentFrame = this.buildHapticFrame(HAPTIC_SILENT, 0);
    await ctx.hidWrite(silentFrame);
    this.usbInitDone.delete(ctx.deviceKey);
    ctx.log('SPC2: Cleanup done (silent frame sent)');
  }

  async reset(ctx: ControllerContext): Promise<void> {
    this.usbInitDone.delete(ctx.deviceKey);
    await this.init(ctx);
  }

  // ── Haptics ──

  supportsVibration(): boolean { return true; }

  async vibrate(ctx: ControllerContext, pattern: VibrationSegment[], gapMs: number = 0): Promise<{ ok: boolean; error?: string }> {
    // Ensure USB init has been performed (haptic engine must be enabled)
    if (!this.usbInitDone.has(ctx.deviceKey)) {
      await this.init(ctx);
    }

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
      // Gap between segments
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
    const buf = this.buildHapticFrame(HAPTIC_SILENT, counter);
    const ok = await ctx.hidWrite(buf);
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
    buf[0] = 0x02; // report ID
    buf[1] = 0x50 | (counter & 0x0F);
    buf[17] = buf[1]; // mirror
    for (let i = 0; i < hapticData.length; i++) {
      buf[2 + i] = hapticData[i];   // left actuator
      buf[18 + i] = hapticData[i];  // right actuator
    }
    return buf;
  }
}

// ── Self-register ──
registerController(new SwitchPro2Controller());
