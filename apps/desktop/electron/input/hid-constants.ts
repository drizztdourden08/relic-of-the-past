/* @layer electron-main @kind logic */
/**
 * HID constants, types, and utilities shared across HID modules.
 */

import type HID from 'node-hid';

// Xbox VID — excluded because Windows XInput driver claims exclusive access
const XBOX_VID = 0x045e;

// Nintendo VID
const NINTENDO_VID = 0x057e;

// All known Nintendo controller PIDs (for general identification)
const NINTENDO_PIDS = new Set([
  0x2009, // Switch Pro Controller
  0x2069, // Switch Pro Controller 2
  0x2006, // Joy-Con L
  0x2007, // Joy-Con R
  0x2066, // Joy-Con 2 L
  0x2067, // Joy-Con 2 R
  0x2073, // GC Controller
]);

/** HID usage pages/usages that indicate a game controller */
const GAMEPAD_USAGE_PAGES = new Set([0x01]); // Generic Desktop
const GAMEPAD_USAGES = new Set([
  0x04, // Joystick
  0x05, // Game Pad
  0x08, // Multi-axis Controller
]);

const toHex4 = (n: number): string => {
  return n.toString(16).padStart(4, '0');
};

interface OpenDevice {
  hid: HID.HID;
  vid: number;
  pid: number;
  key: string; // "vid:pid" (hex, 4-char padded — matches WebHID deviceKey format)
  path: string;
  product: string;
  writeFailed?: boolean;
}

export {
  XBOX_VID,
  NINTENDO_VID,
  NINTENDO_PIDS,
  GAMEPAD_USAGE_PAGES,
  GAMEPAD_USAGES,
  toHex4,
};

export type { OpenDevice };
