/* @layer website-site @kind data */
import type { FeatureGroup } from '../feature-group.type';
import { MAKE_IT_YOURS_SHOTS as SHOTS } from '../shots/make-it-yours-shots.constants';

const MAKE_IT_YOURS_GROUP: FeatureGroup = {
  id: 'make-it-yours',
  numeral: 'V',
  short: 'Make it yours',
  kicker: 'The workshop',
  title: 'Make it yours',
  accent: 'yours',
  lead: "Music packs, outfits and languages, made in the app's studios and shared on the Hookshop.",
  glow: 'violet',
  features: [
    {
      id: 'music-packs',
      label: 'MSU Studio',
      short: 'Music packs',
      title: 'Music packs',
      promise: ['New music, ambience and sound effects.', 'Whatever a pack leaves alone plays from the game.'],
      body: "Load MSU-1 packs or the app's own .msul packs, or build one in MSU Studio with the game's original sound right beside yours.",
      settings: ['MSU-1', '.msul', 'MSU Studio'],
      caption: 'MSU Studio with a pack loaded.',
      layout: 'split',
      visual: {
        kind: 'pins',
        shot: SHOTS['v-25'],
        callouts: [
          { x: 22, y: 40, label: 'Every track by name' },
          { x: 62, y: 62, label: 'The waveform of the replacement' },
          { x: 80, y: 86, label: 'Play the original beside it' },
        ],
      },
    },
    {
      id: 'studios',
      label: 'Studios',
      short: 'Studios',
      title: 'Outfits and languages',
      promise: ['Recolour Link,', 'or translate every line.'],
      body: 'Player Sprite Studio shows every pose in every direction and imports .zspr sheets. Language Studio edits the dialogue line by line and warns when a line will not fit.',
      settings: ['Player Sprite Studio', 'Language Studio', '.zspr'],
      caption: 'The two studios, and the same message in French.',
      layout: 'split',
      visual: {
        kind: 'collage',
        layers: [
          { shot: SHOTS['v-26'], slot: 'top-right', depth: 'back' },
          { shot: SHOTS['v-27'], slot: 'main', depth: 'mid' },
          { shot: SHOTS['v-28'], slot: 'bottom-left', depth: 'front' },
        ],
      },
    },
    {
      id: 'hookshop',
      label: 'Hookshop',
      short: 'Hookshop',
      title: 'The Hookshop',
      promise: ['Community packs,', 'one click away.'],
      body: 'Browse music, sprite and language packs made by players, install them in one click, and share your own.',
      settings: ['Hookshop'],
      caption: 'The store as it opens in the app.',
      layout: 'wide',
      visual: { kind: 'single', shot: SHOTS['v-29'] },
    },
  ],
};

export { MAKE_IT_YOURS_GROUP };
