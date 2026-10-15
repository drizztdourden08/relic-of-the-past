/* @layer tests @kind constants */
import type { ProfileSeed } from '../isolated-app';

const PLAIN_PROFILE: ProfileSeed = { instance: 'hud-style-spec', name: 'visual-test', openByDefault: true, fixtures: [] };

const MODERN_PROFILE: ProfileSeed = {
  instance: 'hud-style-spec-mc',
  name: 'agent/modern-controls',
  openByDefault: true,
  fixtures: [],
  config: {
    hudStyle: 'modern',
    mapOnSelect: false,
    modernScheme: {
      assignments: {
        1: { kind: 'sword' },
        2: { kind: 'action' },
        3: { kind: 'item', hudItem: 1 },
        4: { kind: 'item', hudItem: 2 },
      },
    },
  },
  storedSlots: [
    { index: 1, code: 'KeyS', label: 'S' },
    { index: 2, code: 'KeyD', label: 'D' },
    { index: 3, code: 'KeyW', label: 'W' },
    { index: 4, code: 'KeyE', label: 'E' },
  ],
};

export { MODERN_PROFILE, PLAIN_PROFILE };
