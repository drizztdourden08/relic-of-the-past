/* @layer shared-input @kind logic */
/**
 * Base controller class — abstract definition for all controller implementations.
 * Each concrete controller class self-registers and becomes the single source of truth
 * for identity, UI metadata, SNES mappings, HID parsing, lifecycle, and haptics.
 */

import type { ButtonMapping, ButtonIcon, DeviceFamily, InputApi, SnesButton } from '../types/controls';

// ── Parsed input state from a HID report ──

interface ParsedInput {
  buttons: boolean[];
  axes: number[];
  /** Raw stick values before calibration (for calibration UI) */
  rawSticks?: [number, number, number, number];
}

// ── Controller context (provided by the runtime environment) ──

interface ControllerContext {
  deviceKey: string;
  /** Write raw bytes to the HID device via node-hid in main process */
  hidWrite(data: number[]): Promise<boolean>;
  /** WebUSB: open the USB device (renderer auto-select handler picks it) */
  usbOpen(vid: number, pid: number): Promise<USBDevice | null>;
  /** WebUSB: close an opened USB device */
  usbClose(device: USBDevice): Promise<void>;
  /** Log a diagnostic message */
  log(msg: string): void;
  /** Wait for ms */
  delay(ms: number): Promise<void>;
}

// ── Vibration pattern segment ──

interface VibrationSegment {
  durationMs: number;
  intensity: number; // 0.0 - 1.0
}

// ── Stick calibration defaults (built into controller, before user calibration) ──

interface StickDefaults {
  encoding: '12bit-packed' | '8bit-centered';
  center: number;
  range: number;
  innerDeadzone: number;
  outerDeadzone: number;
}

// ── Button/axis metadata ──

type ButtonCategory = 'face' | 'shoulder' | 'trigger' | 'dpad' | 'stick' | 'system';

interface ControllerButton {
  id: string;
  label: string;
  icon: string;
  category: ButtonCategory;
}

interface ControllerAxis {
  id: string;
  label: string;
  category: 'stick' | 'trigger';
}

// ── Abstract base class ──

abstract class BaseController {
  // ── Identity & Matching ──
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly family: DeviceFamily;
  abstract readonly inputApi: InputApi;
  abstract readonly vendorIds: string[];
  abstract readonly productIds: string[];

  // ── UI Metadata ──
  abstract readonly buttons: ControllerButton[];
  abstract readonly axes: ControllerAxis[];
  abstract readonly brandLogoKey: string | null;
  abstract readonly buttonIcons: Record<string, ButtonIcon>;

  // ── SNES Mapping ──
  abstract readonly defaultMappings: ButtonMapping[];

  // ── HID Report Parsing ──
  // Returns null if this controller doesn't handle the given report ID.
  parseReport(_reportId: number, _data: DataView): ParsedInput | null {
    return null;
  }

  // ── Lifecycle ──
  async init(_ctx: ControllerContext): Promise<void> {}
  async cleanup(_ctx: ControllerContext): Promise<void> {}
  async reset(ctx: ControllerContext): Promise<void> { await this.init(ctx); }

  /**
   * Nintendo USB HID handshake — wakes the controller over USB.
   * All Nintendo HID controllers need this before they'll send reports.
   */
  protected async sendUsbHandshake(ctx: ControllerContext): Promise<void> {
    const cmds = [
      { data: [0x80, 0x01], label: 'MAC req' },
      { data: [0x80, 0x02], label: 'Handshake' },
      { data: [0x80, 0x04], label: 'USB mode' },
    ];
    for (const cmd of cmds) {
      const buf = new Array(64).fill(0);
      for (let i = 0; i < cmd.data.length; i++) buf[i] = cmd.data[i];
      const ok = await ctx.hidWrite(buf);
      ctx.log(`${this.name}: ${ok ? '✓' : '✗'} ${cmd.label}`);
      await ctx.delay(50);
    }
  }

  // ── Haptics ──
  supportsVibration(): boolean { return false; }
  async vibrate(_ctx: ControllerContext, _pattern: VibrationSegment[], _gapMs?: number): Promise<{ ok: boolean; error?: string }> {
    return { ok: false, error: 'vibration not supported' };
  }

  // ── Stick Calibration ──
  getStickDefaults(): StickDefaults | null { return null; }

  // ── Matching ──
  matches(vid: string, pid: string): boolean {
    const v = vid.toLowerCase().padStart(4, '0');
    const p = pid.toLowerCase().padStart(4, '0');
    return this.vendorIds.some(x => x === v) && this.productIds.some(x => x === p);
  }
}

export type {
  ButtonCategory,
  ControllerAxis,
  ControllerButton,
  ControllerContext,
  ParsedInput,
  StickDefaults,
  VibrationSegment
};
export { BaseController };
