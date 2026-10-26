/* @layer renderer-components @kind constants */
import type { CoreVerb } from '@rotp/input-mapping';
import type { ControllerBusType } from '@drizztdourden08/brock-input';
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
    hint: 'These drive the pause menu and are live only while it is open.',
    verbs: ['confirm', 'cancel', 'prevScreen', 'nextScreen'],
  },
];

const MODIFIER_CODES = new Set([
  'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight',
  'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight',
]);

const CANCEL_ARM_DELAY_MS = 150;
const LISTEN_ARM_DELAY_MS = 200;

const VANILLA_ONLY = 'The Modern HUD style uses Modern Controls instead.';
const MODERN_ONLY = 'Needs the Modern HUD style.';

const CONTROLS_TAB_IDS: readonly ControlsTab[] = ['controls', 'modern', 'shortcuts', 'cheats', 'options'];

const GENERIC_DEVICE_ICON = publicAsset('buttons/generic/generic_joystick.svg');

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

const BUS_NAME: Record<ControllerBusType, string | null> = { usb: 'USB', bluetooth: 'Bluetooth', unknown: null };

const PROFILES_FOLD_KEY = 'controls.profiles.collapsed';
const DEVICES_FOLD_KEY = 'controls.devices.collapsed';
const CONTROLS_PANEL_WIDTH = 192;

const SIDE_PANEL_SIZE = { width: 192, minWidth: 160, maxWidth: 360 };

const EMPTY_HINT = 'Assign a controller to this profile to see its slots.';

export {
  ADAPTER_FAMILY_ICON, BUS_NAME, CANCEL_ARM_DELAY_MS, CONTROLS_PANEL_WIDTH, CONTROLS_TAB_IDS, CORE_VERB_GROUPS,
  CORE_VERB_LABELS, DEVICE_FAMILY_ICON, DEVICES_FOLD_KEY, EMPTY_HINT, GENERIC_DEVICE_ICON, LISTEN_ARM_DELAY_MS, MODERN_ONLY,
  MODIFIER_CODES, PROFILES_FOLD_KEY, SDL_TYPE_ICON, SIDE_PANEL_SIZE, VANILLA_ONLY,
};
