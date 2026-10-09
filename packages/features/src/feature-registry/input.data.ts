/* @layer shared @kind data */
import type { FeatureDef } from '../feature.type';

const INPUT_FEATURES: FeatureDef[] = [
  {
    id: 'hostMenu',
    label: 'Host-owned pause menu',
    description:
      'Hands the pause menu to the host: the core stops drawing and running its own menu, and the 24-slot item table is used instead of the 20-slot one.',
    userMessage:
      'Lets the app draw and run the pause menu itself, which is what makes the enhanced menu (gear tiers, the full item grid, bottle slots) possible. The Enhanced and Modern HUD styles turn it on for you, so there is nothing to switch here. It replaces the original menu, so leave those styles off for vanilla parity.',
    group: 'HUD',
    kind: 'features0-bit',
    origin: 'relic',
    flag: 'kFeatures2_HostMenu',
    word: 2,
    bit: 134217728,
    default: false,
    requires: [],
    affectsVanillaParity: true,
    live: true,
  },
  {
    id: 'modernControls',
    label: 'Modern control scheme',
    description:
      'Lets the host write the equipped-item register every frame, so any button can fire any item instead of only Y.',
    userMessage:
      'Lets you put any item on any button instead of only Y, by having the app set the equipped item as you press. The Modern HUD style turns it on for you, and that style is where your bindings are shown, so there is nothing to switch here. Not in the original game, so leave it off for vanilla parity.',
    group: 'Input',
    kind: 'features0-bit',
    origin: 'relic',
    flag: 'kFeatures2_ModernControls',
    word: 2,
    bit: 268435456,
    default: false,
    requires: ['hostMenu'],
    affectsVanillaParity: true,
    live: true,
  },
  {
    id: 'haptics',
    label: 'Controller vibration',
    description: 'Emits rumble/haptic events to the host on game events (damage, pickups, etc.).',
    userMessage:
      'Vibrates supported controllers and devices on in-game events. It does not change what the game computes, but the notify calls are inserted directly into the vendored game code, so Vanilla Safe forces this off along with everything else that touches it.',
    group: 'Input',
    kind: 'host-event',
    origin: 'relic',
    flag: 'kFeatures0_Haptics',
    bit: 1048576,
    default: false,
    requires: [],
    affectsVanillaParity: true,
    live: true,
  },
];

export { INPUT_FEATURES };
