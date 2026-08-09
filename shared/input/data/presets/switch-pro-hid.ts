/* @layer shared-input @kind logic */
/**
 * Nintendo Switch Pro Controller HID report parsers — three report formats for
 * one physical device: USB simple mode (0x3F, short, before the full-mode init
 * subcommand), USB full mode (0x30/0x21/0x31, 12-bit packed sticks), and
 * Bluetooth simple mode (0x3F, ~362 bytes).
 *
 * Bluetooth never completes the USB-only full-mode handshake (see
 * SwitchProController.init()), so a BT-connected pad stays in simple mode
 * forever — but its report is padded to ~362 bytes instead of USB's short one,
 * with buttons shifted one byte later. Report length is what tells the two
 * 0x3F variants apart; a genuine USB simple-mode report is never this long.
 */
import type { ParsedInput } from '../../base';

/**
 * USB simple mode (report 0x3F) — 8-bit sticks, hat-switch dpad.
 * Default USB mode before the full-mode init sequence is sent.
 */
const parseSimple = (data: DataView): ParsedInput => {
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
};

/**
 * Bluetooth simple mode (report 0x3F, ~362 bytes) — same button bits as USB
 * simple mode, shifted one byte later (byte0→1, byte1→2). Confirmed from a real
 * capture (Nintendo, "Wireless Gamepad", connectionHint bluetooth).
 *
 * D-pad is NOT implemented here: the captured byte (3) reads compound,
 * overlapping values (8/12/14/10) rather than clean per-direction bits or a
 * canonical 0-7 hat — that's not decodable from a handful of auto-diffed
 * samples without guessing. Needs a dedicated capture (assign each direction
 * manually via the byte grid, one at a time) before it's implemented.
 *
 * Axes are NOT implemented, same reasoning as the d-pad: bytes 4/6/9/11 looked
 * like clean symmetric 8-bit values in the one capture available, but real
 * testing showed a stick reading full-deflection at idle and never settling —
 * that byte range is not the sticks, or not only the sticks. Rather than feed
 * a live controller constant phantom stick input, this returns neutral (0)
 * until a dedicated, isolated stick capture replaces the guess.
 */
const parseSimpleBluetooth = (data: DataView): ParsedInput => {
  const b0 = data.getUint8(1);
  const b1 = data.getUint8(2);

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
    false,          // 12: DPad Up — not implemented, see doc comment above
    false,          // 13: DPad Down
    false,          // 14: DPad Left
    false,          // 15: DPad Right
    !!(b1 & 0x10),  // 16: Home
    !!(b1 & 0x20),  // 17: Capture
  ];

  const axes: number[] = [0, 0, 0, 0]; // neutral — see doc comment above

  return { buttons, axes };
};

/**
 * USB full mode (report 0x30/0x21/0x31) — 12-bit sticks, 3-byte button data.
 * Active after the USB init sequence is sent.
 */
const parseFull = (data: DataView): ParsedInput => {
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
};

const parseSwitchProReport = (reportId: number, data: DataView): ParsedInput | null => {
  if (reportId === 0x3F && data.byteLength >= 300) return parseSimpleBluetooth(data);
  if (reportId === 0x3F && data.byteLength >= 7) return parseSimple(data);
  if (reportId === 0x30 && data.byteLength >= 11) return parseFull(data);
  if ((reportId === 0x21 || reportId === 0x31) && data.byteLength >= 11) return parseFull(data);
  return null;
};

export { parseSwitchProReport };
