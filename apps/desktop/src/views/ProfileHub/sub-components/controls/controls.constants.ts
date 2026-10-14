/* @layer renderer-components @kind constants */
import type { CoreVerb } from '@rotp/input-mapping';
import { publicAsset } from '@app/public-asset/public-asset';
import type { ControlsTab } from '../controls-settings/controls-settings.type';
import type { CoreVerbGroup } from './controls.type';

const CORE_VERB_LABELS: Record<CoreVerb, string> = {
  up: 'Move Up',
  down: 'Move Down',
  left: 'Move Left',
  right: 'Move Right',
  pause: 'Pause',
  map: 'Map',
  confirm: 'Confirm',
  cancel: 'Cancel',
  prevScreen: 'Previous Screen',
  nextScreen: 'Next Screen',
};

const CORE_VERB_GROUPS: readonly CoreVerbGroup[] = [
  {
    id: 'movement',
    title: 'Movement',
    hint: 'Bind these to the stick to free the whole d-pad for slots.',
    verbs: ['up', 'down', 'left', 'right'],
  },
  {
    id: 'screens',
    title: 'Pause & Map',
    verbs: ['pause', 'map'],
  },
  {
    id: 'menu',
    title: 'Menu',
    hint: 'These four drive the pause menu. They are live only while it is open, so each one can also be a gameplay slot.',
    verbs: ['confirm', 'cancel', 'prevScreen', 'nextScreen'],
  },
];

const MODIFIER_CODES = new Set([
  'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight',
  'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight',
]);

const CANCEL_ARM_DELAY_MS = 150;
const LISTEN_ARM_DELAY_MS = 200;

const CLASSIC_ONLY = 'Per-button mapping belongs to the Classic scheme; Modern binds the ten core verbs and derives the rest as slots.';
const MODERN_ONLY = 'Slots come with the Modern HUD style; this profile is on another style, so there are none to edit.';

const CONTROLS_TAB_IDS: readonly ControlsTab[] = ['controls', 'modern', 'shortcuts', 'cheats'];

const DEVICE_FAMILY_ICON: Record<string, string> = {
  xbox: publicAsset('buttons/xbox/controller_xboxseries.svg'),
  playstation: publicAsset('buttons/generic/generic_joystick.svg'),
  nintendo: publicAsset('buttons/switch/controller_switch_pro.svg'),
  '8bitdo': publicAsset('buttons/generic/generic_joystick.svg'),
  keyboard: publicAsset('buttons/keyboard/keyboard.svg'),
  generic: publicAsset('buttons/generic/generic_joystick.svg'),
};

const ADAPTER_FAMILY_ICON: Record<string, string> = {
  xbox: publicAsset('buttons/xbox/controller_xboxseries.svg'),
  playstation: publicAsset('buttons/generic/generic_joystick.svg'),
  nintendo: publicAsset('buttons/switch/controller_switch_pro.svg'),
  '8bitdo': publicAsset('buttons/generic/generic_joystick.svg'),
  generic: publicAsset('buttons/generic/generic_joystick.svg'),
};

const SDL_TYPE_ICON: Record<string, string> = {
  gamecube: publicAsset('buttons/gc/controller_gamecube.svg'),
};

const FAMILY_EMOJI: Record<string, string> = {
  xbox: '🎮',
  playstation: '🎮',
  nintendo: '🎮',
  '8bitdo': '🎮',
  keyboard: '⌨️',
  generic: '🎮',
};

const EMPTY_HINT = 'Assign a controller to this profile to see its slots. Drop one from the Devices column.';

const BANNER_TEXT = 'Modern controls are part of the Modern HUD style.';
const BANNER_ACTION = 'Enable in HUD settings';

export {
  ADAPTER_FAMILY_ICON, BANNER_ACTION, BANNER_TEXT, CANCEL_ARM_DELAY_MS, CLASSIC_ONLY,
  CONTROLS_TAB_IDS, CORE_VERB_GROUPS, CORE_VERB_LABELS, DEVICE_FAMILY_ICON, EMPTY_HINT, FAMILY_EMOJI,
  LISTEN_ARM_DELAY_MS, MODERN_ONLY, MODIFIER_CODES, SDL_TYPE_ICON,
};
