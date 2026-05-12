/**
 * Generic / fallback controller presets + 8BitDo.
 * Used when VID/PID doesn't match any known controller.
 */

import type { ControllerPreset, ButtonMapping, ButtonIcon } from '../../types/controls';

const icon = (key: string, label: string): ButtonIcon => ({ key, path: null, label });

function btn(snesButton: ButtonMapping['snesButton'], index: number, iconData: ButtonIcon | null): ButtonMapping {
  return { snesButton, binding: { type: 'gamepad-button', index }, icon: iconData };
}

// ── Generic icons (numbered buttons) ──
const GENERIC_ICONS: Record<string, ButtonIcon> = {
  'generic-0':  icon('generic-0', '1'),
  'generic-1':  icon('generic-1', '2'),
  'generic-2':  icon('generic-2', '3'),
  'generic-3':  icon('generic-3', '4'),
  'generic-4':  icon('generic-4', 'L1'),
  'generic-5':  icon('generic-5', 'R1'),
  'generic-8':  icon('generic-8', 'Sel'),
  'generic-9':  icon('generic-9', 'Start'),
  'generic-12': icon('generic-12', '↑'),
  'generic-13': icon('generic-13', '↓'),
  'generic-14': icon('generic-14', '←'),
  'generic-15': icon('generic-15', '→'),
};

const GENERIC_MAPPINGS: ButtonMapping[] = [
  btn('B',      0,  GENERIC_ICONS['generic-0']),
  btn('A',      1,  GENERIC_ICONS['generic-1']),
  btn('Y',      2,  GENERIC_ICONS['generic-2']),
  btn('X',      3,  GENERIC_ICONS['generic-3']),
  btn('L',      4,  GENERIC_ICONS['generic-4']),
  btn('R',      5,  GENERIC_ICONS['generic-5']),
  btn('Select', 8,  GENERIC_ICONS['generic-8']),
  btn('Start',  9,  GENERIC_ICONS['generic-9']),
  btn('Up',     12, GENERIC_ICONS['generic-12']),
  btn('Down',   13, GENERIC_ICONS['generic-13']),
  btn('Left',   14, GENERIC_ICONS['generic-14']),
  btn('Right',  15, GENERIC_ICONS['generic-15']),
];

/** Fallback for any controller with mapping === "standard" */
export const GENERIC_STANDARD: ControllerPreset = {
  id: 'generic-standard',
  name: 'Generic Controller',
  family: 'generic',
  inputApi: 'webapi',
  vendorIds: [],
  productIds: [],
  defaultMappings: GENERIC_MAPPINGS,
  brandLogoKey: 'generic',
  buttonIcons: GENERIC_ICONS,
};

/** Fallback for non-standard/unknown controllers */
export const GENERIC_UNKNOWN: ControllerPreset = {
  id: 'generic-unknown',
  name: 'Unknown Controller',
  family: 'generic',
  inputApi: 'webapi',
  vendorIds: [],
  productIds: [],
  defaultMappings: GENERIC_MAPPINGS,
  brandLogoKey: 'generic',
  buttonIcons: GENERIC_ICONS,
};

// ── 8BitDo (common retro controllers — use Nintendo-style icons) ──

const BITDO_ICONS: Record<string, ButtonIcon> = {
  '8bitdo-b':     icon('8bitdo-b', 'B'),
  '8bitdo-a':     icon('8bitdo-a', 'A'),
  '8bitdo-y':     icon('8bitdo-y', 'Y'),
  '8bitdo-x':     icon('8bitdo-x', 'X'),
  '8bitdo-l':     icon('8bitdo-l', 'L'),
  '8bitdo-r':     icon('8bitdo-r', 'R'),
  '8bitdo-select':icon('8bitdo-select', 'Select'),
  '8bitdo-start': icon('8bitdo-start', 'Start'),
  '8bitdo-dup':   icon('8bitdo-dup', '↑'),
  '8bitdo-ddown': icon('8bitdo-ddown', '↓'),
  '8bitdo-dleft': icon('8bitdo-dleft', '←'),
  '8bitdo-dright':icon('8bitdo-dright', '→'),
};

const BITDO_MAPPINGS: ButtonMapping[] = [
  btn('B',      0,  BITDO_ICONS['8bitdo-b']),
  btn('A',      1,  BITDO_ICONS['8bitdo-a']),
  btn('Y',      2,  BITDO_ICONS['8bitdo-y']),
  btn('X',      3,  BITDO_ICONS['8bitdo-x']),
  btn('L',      4,  BITDO_ICONS['8bitdo-l']),
  btn('R',      5,  BITDO_ICONS['8bitdo-r']),
  btn('Select', 8,  BITDO_ICONS['8bitdo-select']),
  btn('Start',  9,  BITDO_ICONS['8bitdo-start']),
  btn('Up',     12, BITDO_ICONS['8bitdo-dup']),
  btn('Down',   13, BITDO_ICONS['8bitdo-ddown']),
  btn('Left',   14, BITDO_ICONS['8bitdo-dleft']),
  btn('Right',  15, BITDO_ICONS['8bitdo-dright']),
];

function bitdoPreset(id: string, name: string, pids: string[]): ControllerPreset {
  return {
    id,
    name,
    family: '8bitdo',
    inputApi: 'hid',
    vendorIds: ['2dc8'],
    productIds: pids,
    defaultMappings: BITDO_MAPPINGS,
    brandLogoKey: '8bitdo',
    buttonIcons: BITDO_ICONS,
  };
}

export const BITDO_PRO_2     = bitdoPreset('8bitdo-pro-2',    '8BitDo Pro 2',      ['6003', '6002']);
export const BITDO_SN30_PRO  = bitdoPreset('8bitdo-sn30-pro', '8BitDo SN30 Pro',   ['6001']);
export const BITDO_SN30_PLUS = bitdoPreset('8bitdo-sn30-pro+','8BitDo SN30 Pro+',  ['6100']);

export const GENERIC_PRESETS: ControllerPreset[] = [
  BITDO_PRO_2,
  BITDO_SN30_PRO,
  BITDO_SN30_PLUS,
  GENERIC_STANDARD,
  GENERIC_UNKNOWN,
];
