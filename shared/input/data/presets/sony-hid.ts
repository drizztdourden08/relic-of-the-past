/* @layer shared-input @kind logic */
/**
 * Sony controller HID report parsers (USB input report 0x01).
 *
 * DualShock 4 and DualSense lay their report bytes out differently: the DS4
 * puts the two button bytes right after the sticks with the analog triggers at
 * the tail, while the DualSense puts the analog triggers up front and the
 * button bytes after a counter. Each gets its own parser; both emit the
 * standard-gamepad button/axis order the PlayStation preset's mappings expect.
 *
 * Byte offsets below are relative to the DataView the runtime hands us, which
 * already skips the leading report-ID byte (so DataView index 0 = raw byte 1).
 */

import type { ParsedInput } from '../../base';

// D-pad is a hat in the low nibble (0 = up, clockwise to 7 = up-left, 8 = neutral).
const hatToDpad = (hat: number): { up: boolean; down: boolean; left: boolean; right: boolean } => {
  return {
    up: hat === 0 || hat === 1 || hat === 7,
    right: hat === 1 || hat === 2 || hat === 3,
    down: hat === 3 || hat === 4 || hat === 5,
    left: hat === 5 || hat === 6 || hat === 7,
  };
};

// DualShock 4 — sticks, two button bytes, then analog triggers.
const parseDualShock4Report = (reportId: number, data: DataView): ParsedInput | null => {
  if (reportId !== 0x01 || data.byteLength < 9) return null;

  const lx = data.getUint8(0);
  const ly = data.getUint8(1);
  const rx = data.getUint8(2);
  const ry = data.getUint8(3);
  const b0 = data.getUint8(4); // d-pad hat (low nibble) + face buttons
  const b1 = data.getUint8(5); // shoulders, triggers, share/options, stick clicks
  const b2 = data.getUint8(6); // PS + touchpad (upper bits are a frame counter)
  const l2 = data.getUint8(7);
  const r2 = data.getUint8(8);

  const dpad = hatToDpad(b0 & 0x0f);

  const buttons: boolean[] = [
    !!(b0 & 0x20), //  0: Cross
    !!(b0 & 0x40), //  1: Circle
    !!(b0 & 0x10), //  2: Square
    !!(b0 & 0x80), //  3: Triangle
    !!(b1 & 0x01), //  4: L1
    !!(b1 & 0x02), //  5: R1
    !!(b1 & 0x04), //  6: L2 (digital)
    !!(b1 & 0x08), //  7: R2 (digital)
    !!(b1 & 0x10), //  8: Share
    !!(b1 & 0x20), //  9: Options
    !!(b1 & 0x40), // 10: L3
    !!(b1 & 0x80), // 11: R3
    dpad.up,       // 12: D-Pad Up
    dpad.down,     // 13: D-Pad Down
    dpad.left,     // 14: D-Pad Left
    dpad.right,    // 15: D-Pad Right
    !!(b2 & 0x01), // 16: PS
    !!(b2 & 0x02), // 17: Touchpad
  ];

  const axes: number[] = [
    (lx - 128) / 128,
    (ly - 128) / 128,
    (rx - 128) / 128,
    (ry - 128) / 128,
    l2 / 255,
    r2 / 255,
  ];

  return { buttons, axes, rawSticks: [lx, ly, rx, ry] };
};

// DualSense / DualSense Edge — sticks, analog triggers, counter, three button bytes.
const parseDualSenseReport = (reportId: number, data: DataView): ParsedInput | null => {
  if (reportId !== 0x01 || data.byteLength < 10) return null;

  const lx = data.getUint8(0);
  const ly = data.getUint8(1);
  const rx = data.getUint8(2);
  const ry = data.getUint8(3);
  const l2 = data.getUint8(4);
  const r2 = data.getUint8(5);
  const b0 = data.getUint8(7); // d-pad hat (low nibble) + face buttons
  const b1 = data.getUint8(8); // shoulders, triggers, create/options, stick clicks
  const b2 = data.getUint8(9); // PS, touchpad, mute

  const dpad = hatToDpad(b0 & 0x0f);

  const buttons: boolean[] = [
    !!(b0 & 0x20), //  0: Cross
    !!(b0 & 0x40), //  1: Circle
    !!(b0 & 0x10), //  2: Square
    !!(b0 & 0x80), //  3: Triangle
    !!(b1 & 0x01), //  4: L1
    !!(b1 & 0x02), //  5: R1
    !!(b1 & 0x04), //  6: L2 (digital)
    !!(b1 & 0x08), //  7: R2 (digital)
    !!(b1 & 0x10), //  8: Create
    !!(b1 & 0x20), //  9: Options
    !!(b1 & 0x40), // 10: L3
    !!(b1 & 0x80), // 11: R3
    dpad.up,       // 12: D-Pad Up
    dpad.down,     // 13: D-Pad Down
    dpad.left,     // 14: D-Pad Left
    dpad.right,    // 15: D-Pad Right
    !!(b2 & 0x01), // 16: PS
    !!(b2 & 0x02), // 17: Touchpad
    !!(b2 & 0x04), // 18: Mute
  ];

  const axes: number[] = [
    (lx - 128) / 128,
    (ly - 128) / 128,
    (rx - 128) / 128,
    (ry - 128) / 128,
    l2 / 255,
    r2 / 255,
  ];

  return { buttons, axes, rawSticks: [lx, ly, rx, ry] };
};

export { parseDualShock4Report, parseDualSenseReport };
