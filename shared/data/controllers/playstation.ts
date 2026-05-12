/**
 * PlayStation controller presets — DS3, DS4 v1/v2, DualSense, DualSense Edge.
 *
 * Standard Gamepad mapping (Chromium remaps PS controllers):
 *  0=Cross  1=Circle  2=Square  3=Triangle  4=L1  5=R1  6=L2  7=R2
 *  8=Share/Create  9=Options  10=L3  11=R3
 *  12=DUp  13=DDown  14=DLeft  15=DRight  16=PS
 *
 * Default SNES mapping for PlayStation:
 *  SNES B  → Cross (btn 0)   — bottom face = SNES B (confirm in JP layout)
 *  SNES A  → Circle (btn 1)  — right face
 *  SNES Y  → Square (btn 2)  — left face
 *  SNES X  → Triangle (btn 3) — top face
 *  SNES L  → L1 (btn 4)      SNES R  → R1 (btn 5)
 *  SNES Select → Share/Create (btn 8)
 *  SNES Start  → Options (btn 9)
 */

import type { ControllerPreset, ButtonMapping, ButtonIcon } from '../../types/controls';

const icon = (key: string, label: string): ButtonIcon => ({ key, path: null, label });

function btn(snesButton: ButtonMapping['snesButton'], index: number, iconData: ButtonIcon | null): ButtonMapping {
  return { snesButton, binding: { type: 'gamepad-button', index }, icon: iconData };
}

const PS_ICONS: Record<string, ButtonIcon> = {
  'ps-cross':    icon('ps-cross', '✕'),
  'ps-circle':   icon('ps-circle', '○'),
  'ps-square':   icon('ps-square', '□'),
  'ps-triangle': icon('ps-triangle', '△'),
  'ps-l1':       icon('ps-l1', 'L1'),
  'ps-r1':       icon('ps-r1', 'R1'),
  'ps-l2':       icon('ps-l2', 'L2'),
  'ps-r2':       icon('ps-r2', 'R2'),
  'ps-share':    icon('ps-share', 'Share'),
  'ps-options':  icon('ps-options', 'Options'),
  'ps-l3':       icon('ps-l3', 'L3'),
  'ps-r3':       icon('ps-r3', 'R3'),
  'ps-dup':      icon('ps-dup', '↑'),
  'ps-ddown':    icon('ps-ddown', '↓'),
  'ps-dleft':    icon('ps-dleft', '←'),
  'ps-dright':   icon('ps-dright', '→'),
};

// DualSense uses "Create" instead of "Share"
const PS5_ICONS: Record<string, ButtonIcon> = {
  ...PS_ICONS,
  'ps-share': icon('ps-create', 'Create'),
};

const PS_MAPPINGS: ButtonMapping[] = [
  btn('B',      0,  PS_ICONS['ps-cross']),
  btn('A',      1,  PS_ICONS['ps-circle']),
  btn('Y',      2,  PS_ICONS['ps-square']),
  btn('X',      3,  PS_ICONS['ps-triangle']),
  btn('L',      4,  PS_ICONS['ps-l1']),
  btn('R',      5,  PS_ICONS['ps-r1']),
  btn('Select', 8,  PS_ICONS['ps-share']),
  btn('Start',  9,  PS_ICONS['ps-options']),
  btn('Up',     12, PS_ICONS['ps-dup']),
  btn('Down',   13, PS_ICONS['ps-ddown']),
  btn('Left',   14, PS_ICONS['ps-dleft']),
  btn('Right',  15, PS_ICONS['ps-dright']),
];

const PS5_MAPPINGS: ButtonMapping[] = [
  btn('B',      0,  PS5_ICONS['ps-cross']),
  btn('A',      1,  PS5_ICONS['ps-circle']),
  btn('Y',      2,  PS5_ICONS['ps-square']),
  btn('X',      3,  PS5_ICONS['ps-triangle']),
  btn('L',      4,  PS5_ICONS['ps-l1']),
  btn('R',      5,  PS5_ICONS['ps-r1']),
  btn('Select', 8,  PS5_ICONS['ps-share']),
  btn('Start',  9,  PS5_ICONS['ps-options']),
  btn('Up',     12, PS5_ICONS['ps-dup']),
  btn('Down',   13, PS5_ICONS['ps-ddown']),
  btn('Left',   14, PS5_ICONS['ps-dleft']),
  btn('Right',  15, PS5_ICONS['ps-dright']),
];

function psPreset(
  id: string, name: string, pids: string[],
  mappings: ButtonMapping[], icons: Record<string, ButtonIcon>,
): ControllerPreset {
  return {
    id,
    name,
    family: 'playstation',
    inputApi: 'hid',
    vendorIds: ['054c'],
    productIds: pids,
    defaultMappings: mappings,
    brandLogoKey: 'playstation',
    buttonIcons: icons,
  };
}

export const DUALSHOCK_3      = psPreset('ds3',             'DualShock 3',      ['0268'], PS_MAPPINGS, PS_ICONS);
export const DUALSHOCK_4_V1   = psPreset('ds4-v1',          'DualShock 4',      ['05c4'], PS_MAPPINGS, PS_ICONS);
export const DUALSHOCK_4_V2   = psPreset('ds4-v2',          'DualShock 4 v2',   ['09cc'], PS_MAPPINGS, PS_ICONS);
export const DUALSENSE        = psPreset('dualsense',        'DualSense',        ['0ce6'], PS5_MAPPINGS, PS5_ICONS);
export const DUALSENSE_EDGE   = psPreset('dualsense-edge',   'DualSense Edge',   ['0df2'], PS5_MAPPINGS, PS5_ICONS);

export const PLAYSTATION_PRESETS: ControllerPreset[] = [
  DUALSHOCK_3,
  DUALSHOCK_4_V1,
  DUALSHOCK_4_V2,
  DUALSENSE,
  DUALSENSE_EDGE,
];
