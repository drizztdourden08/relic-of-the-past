/* @layer website-site @kind data */
import type { FeatureGroup } from '../feature-group.type';
import { ORIGINAL_SHOTS as SHOTS } from '../shots/original-shots.constants';
import { UI_SHOTS as UI } from '../shots/ui-shots.constants';

const ORIGINAL_GROUP: FeatureGroup = {
  id: 'original',
  numeral: 'I',
  short: 'The original',
  kicker: 'The original',
  title: 'The classic, running natively',
  accent: 'natively',
  lead: 'The original game, rebuilt in C and running as a real app. No emulator.',
  glow: 'forest',
  features: [
    {
      id: 'vanilla-safe',
      label: 'Vanilla Safe',
      short: 'Vanilla Safe',
      title: 'As close to the original as you like',
      promise: ['The bugs, glitches and quirks you expect,', 'or every new comfort. You choose.'],
      body: 'Vanilla Safe runs the game exactly as the original, bugs and glitches included. Every new feature is its own switch, so you can stay that close or go as far as you like.',
      settings: ['Vanilla Safe'],
      caption: 'Vanilla Safe in the gameplay settings.',
      layout: 'split',
      visual: { kind: 'single', shot: UI.vanillaSafe },
    },
    {
      id: 'no-emulator',
      label: 'Native',
      short: 'No emulator',
      title: 'No emulator in between',
      promise: ['The real game, rebuilt as an app.', 'It plays the way you remember.'],
      body: 'The game runs natively on your computer and your phone. You bring your own ROM.',
      settings: [
        { label: 'Windows', logo: 'windows' },
        { label: 'Linux', logo: 'linux' },
        { label: 'macOS', logo: 'macos' },
        { label: 'Android', logo: 'android' },
      ],
      caption: 'The real game, pixel for pixel.',
      layout: 'split',
      visual: {
        kind: 'collage',
        layers: [
          { shot: SHOTS['v-01'], slot: 'main', depth: 'mid' },
          { shot: SHOTS['v-02'], slot: 'bottom-right', depth: 'front' },
        ],
      },
    },
    {
      id: 'app',
      label: 'The app',
      short: 'The app',
      title: 'A full app around the game',
      promise: ['Widgets, menus and profiles.', 'Every setting is yours.'],
      body: 'Dock widgets like the Checks tracker beside the game, and change almost anything in the settings.',
      settings: ['Widgets', 'Settings'],
      caption: 'The game with its widgets, the world map and the settings.',
      layout: 'split',
      visual: {
        kind: 'collage',
        layers: [
          { shot: UI.appWidgets, slot: 'main', depth: 'mid' },
          { shot: UI.appMap, slot: 'top-right', depth: 'back' },
          { shot: UI.settingsGraphics, slot: 'bottom-right', depth: 'front' },
          { shot: UI.settingsHud, slot: 'bottom-left', depth: 'front' },
        ],
      },
    },
    {
      id: 'mode-7',
      label: 'Enhanced Mode 7',
      short: 'Mode 7',
      title: 'A sharp world map',
      promise: ['A sharp world map.', 'Smooth turning, no blocky zoom.'],
      body: "The world map and the bird flights are drawn sharp, not in the console's blocky Mode 7.",
      settings: ['Mode 7'],
      caption: 'Death Mountain before and after, magnified.',
      layout: 'split',
      visual: {
        kind: 'lens',
        shot: SHOTS['v-06'],
        lens: { x: 0.5, y: 0.172 },
        before: SHOTS['v-05-lens'],
        after: SHOTS['v-06-lens'],
      },
    },
  ],
};

export { ORIGINAL_GROUP };
