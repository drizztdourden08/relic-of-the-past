/* @layer website-site @kind data */
import type { FeatureGroup } from '../feature-group.type';
import { ORIGINAL_SHOTS as SHOTS } from '../shots/original-shots.constants';

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
      settings: ['Windows', 'Linux', 'macOS', 'Android'],
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
      id: 'no-flicker',
      label: 'No Sprite Limit',
      short: 'No flicker',
      title: 'No more flicker',
      promise: ['Every sprite, every frame.', 'Crowded scenes stop blinking.'],
      body: 'The console could only draw so many sprites on one line, so in crowded scenes enemies lost pieces or blinked. No Sprite Limit draws them all, and V-Sync keeps the scrolling smooth.',
      settings: ['No Sprite Limit', 'V-Sync'],
      caption: 'A crowded room. With the limit on, enemies lose parts of their sprites. With No Sprite Limit every sprite is drawn whole.',
      layout: 'split',
      visual: { kind: 'clip', poster: SHOTS['v-03'], loop: SHOTS['v-03-anim'], after: SHOTS['v-04'] },
    },
    {
      id: 'mode-7',
      label: 'Enhanced Mode 7',
      short: 'Mode 7',
      title: 'A sharp world map',
      promise: ['The world map in high resolution.', 'Smooth rotation and scaling, no blocky zoom.'],
      body: "The world map and the flights with the bird are drawn at full resolution instead of the console's pixelated Mode 7.",
      settings: ['Enhanced Mode 7'],
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
