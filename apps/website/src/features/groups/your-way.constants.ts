/* @layer website-site @kind data */
import type { FeatureGroup } from '../feature-group.type';
import { YOUR_WAY_SHOTS as SHOTS } from '../shots/your-way-shots.constants';

const YOUR_WAY_GROUP: FeatureGroup = {
  id: 'your-way',
  numeral: 'III',
  short: 'Your way',
  kicker: 'Your rules',
  title: 'Play it your way',
  accent: 'your way',
  lead: 'Any controller, save anywhere, and the small fixes the original never had.',
  glow: 'gold',
  features: [
    {
      id: 'controllers',
      label: 'Controls',
      short: 'Controllers',
      title: 'Any controller, any button',
      promise: ['Plug it in and play.', 'Remap every action.'],
      body: 'Xbox, PlayStation and Switch Pro pads come with ready layouts and vibration. Bind any action to any button or key, per profile.',
      settings: ['Controller presets', 'Vibration', 'Profiles'],
      caption: 'The controls page: every action, every button.',
      layout: 'split',
      visual: {
        kind: 'collage',
        layers: [
          { shot: SHOTS['v-16'], slot: 'main', depth: 'mid' },
          { shot: SHOTS['v-16b'], slot: 'top-right', depth: 'back' },
        ],
      },
    },
    {
      id: 'small-fixes',
      label: 'Gameplay',
      short: 'Small fixes',
      title: 'Small fixes, big difference',
      promise: ['The comforts the original never had.', 'One switch puts it all back.'],
      body: 'Turn while dashing, collect items and break pots with the sword, carry more rupees, skip the intro, and play at Turbo speed. Vanilla Safe turns every change off at once.',
      settings: ['Vanilla Safe', 'Turbo'],
      caption: 'The gameplay settings. Each row is one switch.',
      layout: 'split',
      visual: {
        kind: 'pins',
        shot: SHOTS['v-17'],
        callouts: [
          { x: 92, y: 34, label: 'Auto-save on a timer' },
          { x: 70, y: 48, label: 'Choose how often' },
          { x: 92, y: 72, label: 'Save when you quit' },
          { x: 92, y: 91, label: 'A shortcut for the save slots' },
        ],
      },
    },
    {
      id: 'saves',
      label: 'Saves',
      short: 'Saves',
      title: 'Save anywhere',
      promise: ['Quick saves, auto-saves,', 'real screenshots.'],
      body: 'Save to a slot at any moment, let auto-saves run on a timer and when you quit, and see a full screenshot of each. Bring in a save from another emulator too.',
      settings: ['Quick saves', 'Auto-save', 'Import Save'],
      caption: 'The saves list on the home screen, a screenshot for each.',
      layout: 'split',
      visual: {
        kind: 'collage',
        layers: [
          { shot: SHOTS['v-18'], slot: 'main', depth: 'mid' },
          { shot: SHOTS['v-18a'], slot: 'bottom-right', depth: 'front' },
          { shot: SHOTS['v-18b'], slot: 'bottom-left', depth: 'front' },
        ],
      },
    },
  ],
};

export { YOUR_WAY_GROUP };
