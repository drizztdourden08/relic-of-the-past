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
  lead: 'The original game logic, rebuilt in C and compiled into a real app. No emulator in between.',
  glow: 'forest',
  features: [
    {
      id: 'no-emulator',
      label: 'Native',
      short: 'No emulator',
      title: 'No emulator in between',
      promise: ['The real game, rebuilt as an app.', 'It plays the way you remember.'],
      body: 'The reverse-engineered game code runs natively on your computer and your phone. Bring your own ROM: nothing from the game is downloaded.',
      settings: [
        { label: 'Windows', logo: 'windows' },
        { label: 'Linux', logo: 'linux' },
        { label: 'macOS', logo: 'macos' },
        { label: 'Android', logo: 'android' },
      ],
      caption: 'The real game at 4:3, pixel for pixel.',
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
      promise: ['Widgets, menus and profiles.', 'Every setting is yours to change.'],
      body: 'The game comes with a complete interface: widgets you can dock beside it, such as the Checks tracker, and a settings screen where every option the app offers, from the view to the controls, can be changed.',
      settings: ['Widgets', 'Settings'],
      caption: 'The game with its widgets docked around it, the world map with the Checks and Inventory widgets, and the settings screens.',
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
      promise: ['The world map in high resolution.', 'Smooth rotation and scaling, no blocky zoom.'],
      body: "The world map and the flights with the bird are drawn at full resolution instead of the console's pixelated Mode 7.",
      settings: ['Mode 7'],
      caption: 'The same square of Death Mountain, before and after, at eight times its native size.',
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
