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

const VANILLA_ONLY = 'The Modern HUD style replaces the original buttons with core verbs and slots. See Modern Controls.';
const MODERN_ONLY = 'Modern controls come with the Modern HUD style. Without it, the original buttons apply.';

const CONTROLS_TAB_IDS: readonly ControlsTab[] = ['controls', 'modern', 'shortcuts', 'cheats', 'options'];

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

const REQUIRED_INPUTS_DESCRIPTION = 'The devices the bindings of this profile use.';

const EMPTY_HINT = 'Assign a controller to this profile to see its slots. Drop one from the Devices column.';

export {
  ADAPTER_FAMILY_ICON, CANCEL_ARM_DELAY_MS, CONTROLS_TAB_IDS, CORE_VERB_GROUPS,
  CORE_VERB_LABELS, DEVICE_FAMILY_ICON, EMPTY_HINT, LISTEN_ARM_DELAY_MS, MODERN_ONLY,
  MODIFIER_CODES, REQUIRED_INPUTS_DESCRIPTION, SDL_TYPE_ICON, VANILLA_ONLY,
};
