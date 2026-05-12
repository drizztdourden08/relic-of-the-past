/**
 * Xbox controller presets — 360, One, One S, Elite, Elite 2, Series X|S, Adaptive.
 *
 * Standard Gamepad mapping (Chromium remaps Xbox controllers to this):
 *  0=A  1=B  2=X  3=Y  4=LB  5=RB  6=LT  7=RT
 *  8=Back/View  9=Start/Menu  10=LS  11=RS
 *  12=DUp  13=DDown  14=DLeft  15=DRight  16=Guide
 *
 * Default SNES mapping for Xbox:
 *  SNES A  → Xbox A (btn 0)      SNES B  → Xbox B (btn 1)
 *  SNES X  → Xbox X (btn 2)      SNES Y  → Xbox Y (btn 3)
 *  SNES L  → Xbox LB (btn 4)     SNES R  → Xbox RB (btn 5)
 *  SNES Start  → Xbox Menu (btn 9)
 *  SNES Select → Xbox View (btn 8)
 *  D-Pad via buttons 12-15
 */

import type { ControllerPreset, ButtonMapping, ButtonIcon } from '../../types/controls';

const icon = (key: string, label: string): ButtonIcon => ({ key, path: null, label });

function btn(snesButton: ButtonMapping['snesButton'], index: number, iconData: ButtonIcon | null): ButtonMapping {
  return { snesButton, binding: { type: 'gamepad-button', index }, icon: iconData };
}

const XBOX_ICONS: Record<string, ButtonIcon> = {
  'xbox-a':     icon('xbox-a', 'A'),
  'xbox-b':     icon('xbox-b', 'B'),
  'xbox-x':     icon('xbox-x', 'X'),
  'xbox-y':     icon('xbox-y', 'Y'),
  'xbox-lb':    icon('xbox-lb', 'LB'),
  'xbox-rb':    icon('xbox-rb', 'RB'),
  'xbox-lt':    icon('xbox-lt', 'LT'),
  'xbox-rt':    icon('xbox-rt', 'RT'),
  'xbox-view':  icon('xbox-view', 'View'),
  'xbox-menu':  icon('xbox-menu', 'Menu'),
  'xbox-ls':    icon('xbox-ls', 'LS'),
  'xbox-rs':    icon('xbox-rs', 'RS'),
  'xbox-dup':   icon('xbox-dup', '↑'),
  'xbox-ddown': icon('xbox-ddown', '↓'),
  'xbox-dleft': icon('xbox-dleft', '←'),
  'xbox-dright':icon('xbox-dright', '→'),
};

const XBOX_MAPPINGS: ButtonMapping[] = [
  btn('A',      0,  XBOX_ICONS['xbox-a']),
  btn('B',      1,  XBOX_ICONS['xbox-b']),
  btn('X',      2,  XBOX_ICONS['xbox-x']),
  btn('Y',      3,  XBOX_ICONS['xbox-y']),
  btn('L',      4,  XBOX_ICONS['xbox-lb']),
  btn('R',      5,  XBOX_ICONS['xbox-rb']),
  btn('Start',  9,  XBOX_ICONS['xbox-menu']),
  btn('Select', 8,  XBOX_ICONS['xbox-view']),
  btn('Up',     12, XBOX_ICONS['xbox-dup']),
  btn('Down',   13, XBOX_ICONS['xbox-ddown']),
  btn('Left',   14, XBOX_ICONS['xbox-dleft']),
  btn('Right',  15, XBOX_ICONS['xbox-dright']),
];

function xboxPreset(id: string, name: string, pids: string[]): ControllerPreset {
  return {
    id,
    name,
    family: 'xbox',
    inputApi: 'xinput',
    vendorIds: ['045e'],
    productIds: pids,
    defaultMappings: XBOX_MAPPINGS,
    brandLogoKey: 'xbox',
    buttonIcons: XBOX_ICONS,
  };
}

export const XBOX_360_WIRED       = xboxPreset('xbox-360-wired',       'Xbox Controller',               ['028e']);
export const XBOX_360_WIRELESS    = xboxPreset('xbox-360-wireless',    'Xbox 360 Wireless Controller',  ['028f', '0719']);
export const XBOX_ONE             = xboxPreset('xbox-one',             'Xbox One Controller',           ['02d1', '02dd', '02e3']);
export const XBOX_ONE_S_BT       = xboxPreset('xbox-one-s-bt',        'Xbox One S Controller (BT)',    ['02e0', '02fd']);
export const XBOX_ONE_ELITE      = xboxPreset('xbox-one-elite',       'Xbox One Elite Controller',     ['02e3']);
export const XBOX_ONE_ELITE_2    = xboxPreset('xbox-one-elite-2',     'Xbox Elite Series 2',           ['0b00', '0b05']);
export const XBOX_SERIES_XS      = xboxPreset('xbox-series-xs',       'Xbox Series X|S Controller',    ['0b12', '0b13']);
export const XBOX_ADAPTIVE       = xboxPreset('xbox-adaptive',        'Xbox Adaptive Controller',      ['0b0a']);

export const XBOX_PRESETS: ControllerPreset[] = [
  XBOX_360_WIRED,
  XBOX_360_WIRELESS,
  XBOX_ONE,
  XBOX_ONE_S_BT,
  XBOX_ONE_ELITE,
  XBOX_ONE_ELITE_2,
  XBOX_SERIES_XS,
  XBOX_ADAPTIVE,
];
