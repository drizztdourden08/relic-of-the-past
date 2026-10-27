/* @layer website-site @kind data */
import type { FeatureGroup } from '../feature-group.type';
import { UI_SHOTS as UI } from '../shots/ui-shots.constants';
import { YOUR_WAY_SHOTS as SHOTS } from '../shots/your-way-shots.constants';

const YOUR_WAY_GROUP: FeatureGroup = {
  id: 'your-way',
  numeral: 'III',
  short: 'Your way',
  kicker: 'Your rules',
  title: 'Play it your way',
  accent: 'your way',
  lead: 'Any controller, the small fixes the original never had, and a save state at any moment.',
  glow: 'gold',
  features: [
    {
      id: 'controllers',
      label: 'Controls',
      short: 'Controllers',
      title: 'Any controller, any button',
      promise: ['Plug it in and play.', 'Remap every action.'],
      body: 'Xbox, PlayStation and Switch Pro pads come with ready layouts and vibration. Bind any action to any button or key, per profile, on the mapping page.',
      settings: ['Controller presets', 'Vibration', 'Profiles'],
      caption: 'The mapping page, and the controllers screen with the pad drawn out.',
      layout: 'split',
      visual: {
        kind: 'collage',
        layers: [
          { shot: UI.controlsMapping, slot: 'main', depth: 'mid' },
          { shot: UI.controllers, slot: 'top-right', depth: 'back' },
        ],
      },
    },
    {
      id: 'small-fixes',
      label: 'Gameplay',
      short: 'Gameplay fixes',
      title: 'Small fixes, big difference',
      promise: ['The comforts the original never had.', 'One switch puts it all back.'],
      body: 'Turn while dashing, dive with the flippers, collect items and break pots with the sword, place more bombs, and play at Turbo speed. Vanilla Safe turns every change off at once.',
      settings: ['Vanilla Safe', 'Turbo'],
      caption: 'The gameplay fixes settings. Each row is one switch.',
      layout: 'split',
      visual: {
        kind: 'pins',
        shot: UI.gameplayFixes,
        callouts: [
          { x: 16.8, y: 25, label: 'Turn While Dashing' },
          { x: 16.8, y: 52, label: 'Allow Diving with Flippers' },
          { x: 16.8, y: 73, label: 'Collect Items with Sword' },
          { x: 16.8, y: 91, label: 'More Active Bombs' },
        ],
      },
    },
    {
      id: 'save-states',
      label: 'Save states',
      short: 'Save states',
      title: 'Full save states',
      promise: ['Save the whole game, anywhere.', 'Quick saves, auto-saves, real screenshots.'],
      body: 'Save to a slot at any moment and come back to exactly that frame. Let auto-saves run on a timer and when you quit, and see a full screenshot of each. Bring in a save from another emulator too.',
      settings: ['Quick saves', 'Auto-save', 'Import Save'],
      caption: 'The saves list on the home screen, a screenshot for each, and the auto-save settings.',
      layout: 'split',
      visual: {
        kind: 'collage',
        layers: [
          { shot: SHOTS['v-18'], slot: 'main', depth: 'mid' },
          { shot: SHOTS['v-17'], slot: 'top-right', depth: 'back' },
          { shot: SHOTS['v-18a'], slot: 'bottom-right', depth: 'front' },
          { shot: SHOTS['v-18b'], slot: 'bottom-left', depth: 'front' },
        ],
      },
    },
  ],
};

export { YOUR_WAY_GROUP };
