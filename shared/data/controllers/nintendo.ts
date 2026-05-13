/**
 * Nintendo controller presets — Switch Pro, Joy-Con L/R, Wii U Pro,
 * SNES (NSO), N64 (NSO), NES (NSO), GameCube Adapter.
 *
 * Standard Gamepad mapping (Chromium remaps Switch Pro):
 *  0=B  1=A  2=Y  3=X  4=L  5=R  6=ZL  7=ZR
 *  8=Minus  9=Plus  10=LS  11=RS
 *  12=DUp  13=DDown  14=DLeft  15=DRight  16=Home
 *
 * Note: Nintendo layout has A/B and X/Y swapped vs Xbox positionally.
 * Chromium's "standard" mapping normalises to positional:
 *   btn 0 = bottom face (Nintendo B) btn 1 = right face (Nintendo A)
 *   btn 2 = left face (Nintendo Y)   btn 3 = top face (Nintendo X)
 *
 * Default SNES mapping:
 *  SNES B  → btn 0 (bottom)    SNES A  → btn 1 (right)
 *  SNES Y  → btn 2 (left)      SNES X  → btn 3 (top)
 *  SNES L  → btn 4             SNES R  → btn 5
 *  SNES Select → Minus (btn 8) SNES Start → Plus (btn 9)
 */

import type { ControllerPreset, ButtonMapping, ButtonIcon } from '../../types/controls';

const icon = (key: string, label: string): ButtonIcon => ({ key, path: null, label });

function btn(snesButton: ButtonMapping['snesButton'], index: number, iconData: ButtonIcon | null): ButtonMapping {
  return { snesButton, binding: { type: 'gamepad-button', index }, icon: iconData };
}

const SWITCH_ICONS: Record<string, ButtonIcon> = {
  'switch-b':     icon('switch-b', 'B Button'),
  'switch-a':     icon('switch-a', 'A Button'),
  'switch-y':     icon('switch-y', 'Y Button'),
  'switch-x':     icon('switch-x', 'X Button'),
  'switch-l':     icon('switch-l', 'L Bumper'),
  'switch-r':     icon('switch-r', 'R Bumper'),
  'switch-zl':    icon('switch-zl', 'ZL Trigger'),
  'switch-zr':    icon('switch-zr', 'ZR Trigger'),
  'switch-minus': icon('switch-minus', 'Minus'),
  'switch-plus':  icon('switch-plus', 'Plus'),
  'switch-ls':    icon('switch-ls', 'Left Stick'),
  'switch-rs':    icon('switch-rs', 'Right Stick'),
  'switch-dup':   icon('switch-dup', 'D-Pad Up'),
  'switch-ddown': icon('switch-ddown', 'D-Pad Down'),
  'switch-dleft': icon('switch-dleft', 'D-Pad Left'),
  'switch-dright':icon('switch-dright', 'D-Pad Right'),
};

const SNES_NSO_ICONS: Record<string, ButtonIcon> = {
  'snes-b':      icon('snes-b', 'B Button'),
  'snes-a':      icon('snes-a', 'A Button'),
  'snes-y':      icon('snes-y', 'Y Button'),
  'snes-x':      icon('snes-x', 'X Button'),
  'snes-l':      icon('snes-l', 'L Bumper'),
  'snes-r':      icon('snes-r', 'R Bumper'),
  'snes-select': icon('snes-select', 'Select'),
  'snes-start':  icon('snes-start', 'Start'),
  'snes-dup':    icon('snes-dup', 'D-Pad Up'),
  'snes-ddown':  icon('snes-ddown', 'D-Pad Down'),
  'snes-dleft':  icon('snes-dleft', 'D-Pad Left'),
  'snes-dright': icon('snes-dright', 'D-Pad Right'),
};

const SWITCH_MAPPINGS: ButtonMapping[] = [
  btn('B',      0,  SWITCH_ICONS['switch-b']),
  btn('A',      1,  SWITCH_ICONS['switch-a']),
  btn('Y',      2,  SWITCH_ICONS['switch-y']),
  btn('X',      3,  SWITCH_ICONS['switch-x']),
  btn('L',      4,  SWITCH_ICONS['switch-l']),
  btn('R',      5,  SWITCH_ICONS['switch-r']),
  btn('Select', 8,  SWITCH_ICONS['switch-minus']),
  btn('Start',  9,  SWITCH_ICONS['switch-plus']),
  btn('Up',     12, SWITCH_ICONS['switch-dup']),
  btn('Down',   13, SWITCH_ICONS['switch-ddown']),
  btn('Left',   14, SWITCH_ICONS['switch-dleft']),
  btn('Right',  15, SWITCH_ICONS['switch-dright']),
];

const SNES_NSO_MAPPINGS: ButtonMapping[] = [
  btn('B',      0,  SNES_NSO_ICONS['snes-b']),
  btn('A',      1,  SNES_NSO_ICONS['snes-a']),
  btn('Y',      2,  SNES_NSO_ICONS['snes-y']),
  btn('X',      3,  SNES_NSO_ICONS['snes-x']),
  btn('L',      4,  SNES_NSO_ICONS['snes-l']),
  btn('R',      5,  SNES_NSO_ICONS['snes-r']),
  btn('Select', 8,  SNES_NSO_ICONS['snes-select']),
  btn('Start',  9,  SNES_NSO_ICONS['snes-start']),
  btn('Up',     12, SNES_NSO_ICONS['snes-dup']),
  btn('Down',   13, SNES_NSO_ICONS['snes-ddown']),
  btn('Left',   14, SNES_NSO_ICONS['snes-dleft']),
  btn('Right',  15, SNES_NSO_ICONS['snes-dright']),
];

function nintendoPreset(
  id: string, name: string, pids: string[],
  mappings: ButtonMapping[], icons: Record<string, ButtonIcon>,
): ControllerPreset {
  return {
    id,
    name,
    family: 'nintendo',
    inputApi: 'hid',
    vendorIds: ['057e'],
    productIds: pids,
    defaultMappings: mappings,
    brandLogoKey: 'nintendo',
    buttonIcons: icons,
  };
}

export const SWITCH_PRO        = nintendoPreset('switch-pro',       'Switch Pro Controller',       ['2009'], SWITCH_MAPPINGS, SWITCH_ICONS);
export const SWITCH_PRO_2      = nintendoPreset('switch-pro-2',     'Switch Pro Controller 2',     ['2069'], SWITCH_MAPPINGS, SWITCH_ICONS);
export const JOYCON_L          = nintendoPreset('joycon-l',         'Joy-Con (L)',                 ['2006'], SWITCH_MAPPINGS, SWITCH_ICONS);
export const JOYCON_R          = nintendoPreset('joycon-r',         'Joy-Con (R)',                 ['2007'], SWITCH_MAPPINGS, SWITCH_ICONS);
export const WII_U_PRO         = nintendoPreset('wiiu-pro',         'Wii U Pro Controller',        ['0330'], SWITCH_MAPPINGS, SWITCH_ICONS);
export const SNES_NSO          = nintendoPreset('snes-nso',         'SNES Controller (NSO)',        ['2017'], SNES_NSO_MAPPINGS, SNES_NSO_ICONS);
export const N64_NSO           = nintendoPreset('n64-nso',          'N64 Controller (NSO)',         ['2019'], SWITCH_MAPPINGS, SWITCH_ICONS);
export const NES_NSO           = nintendoPreset('nes-nso',          'NES Controller (NSO)',         ['2018'], SWITCH_MAPPINGS, SWITCH_ICONS);
export const GAMECUBE_ADAPTER  = nintendoPreset('gc-adapter',       'GameCube Controller Adapter',  ['0337'], SWITCH_MAPPINGS, SWITCH_ICONS);

export const NINTENDO_PRESETS: ControllerPreset[] = [
  SWITCH_PRO,
  SWITCH_PRO_2,
  JOYCON_L,
  JOYCON_R,
  WII_U_PRO,
  SNES_NSO,
  N64_NSO,
  NES_NSO,
  GAMECUBE_ADAPTER,
];
