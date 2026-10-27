/* @layer website-site @kind data */
import type { FeatureGroup } from '../feature-group.type';
import { UI_SHOTS as UI } from '../shots/ui-shots.constants';

const COMMUNITY_GROUP: FeatureGroup = {
  id: 'community',
  numeral: 'V',
  short: 'Community',
  kicker: 'The community',
  title: 'Made by players, shared with players',
  accent: 'players',
  lead: 'Players make music, outfits and translations, and share them. The Hookshop and the Sanctuary are where they meet, and three studios in the app are where it is made.',
  glow: 'violet',
  features: [
    {
      id: 'hookshop',
      label: 'Hookshop',
      short: 'Hookshop',
      title: 'The Hookshop',
      promise: ['Community packs,', 'one click away.'],
      body: 'Browse music, sprite and language packs made by players, install them in one click, and share your own.',
      settings: ['Hookshop'],
      caption: 'The Hookshop site.',
      layout: 'split',
      visual: { kind: 'single', shot: UI.hookshop },
    },
    {
      id: 'sanctuary',
      label: 'Sanctuary',
      short: 'Sanctuary',
      title: 'The Sanctuary',
      promise: ['Where players report and share.', 'Bugs go from the app straight to the team.'],
      body: 'The Sanctuary is the community site. Players file bug reports from inside the app, each one with its debug files attached and a GitHub issue opened for it, and the reports and shared files can be browsed and searched there.',
      settings: ['Reports', 'Files'],
      caption: 'The Sanctuary site.',
      layout: 'split',
      visual: { kind: 'single', shot: UI.sanctuary },
    },
    {
      id: 'music-packs',
      label: 'MSU Studio',
      short: 'MSU Studio',
      title: 'MSU Studio',
      promise: ['New music, ambience and sound effects.', 'Whatever a pack leaves alone plays from the game.'],
      body: "Load MSU-1 packs or the app's own .msul packs, or build one in MSU Studio with the game's original sound right beside yours.",
      settings: ['MSU-1', '.msul', 'MSU Studio'],
      caption: 'MSU Studio with a new pack, every track slot listed.',
      layout: 'split',
      visual: { kind: 'single', shot: UI.msuStudio },
    },
    {
      id: 'sprite-studio',
      label: 'Player Sprite Studio',
      short: 'Sprite Studio',
      title: 'Player Sprite Studio',
      promise: ['Recolour Link,', 'or redraw him.'],
      body: 'The Player Sprite Studio shows every pose in every direction, and imports .zspr sheets so outfits from the wider community work here too.',
      settings: ['Player Sprite Studio', '.zspr'],
      caption: 'The Player Sprite Studio animating Link in four directions, and its tile sheet.',
      layout: 'split',
      visual: {
        kind: 'collage',
        layers: [
          { shot: UI.spriteStudio, slot: 'main', depth: 'mid' },
          { shot: UI.spriteSheet, slot: 'bottom-right', depth: 'front' },
        ],
      },
    },
    {
      id: 'language-studio',
      label: 'Language Studio',
      short: 'Language Studio',
      title: 'Language Studio',
      promise: ['Translate every line.', 'The studio warns when one will not fit.'],
      body: 'Language Studio edits the dialogue line by line and warns when a line will not fit in its box, so a translation can be finished and shared.',
      settings: ['Language Studio'],
      caption: 'The Language Studio with a line of dialogue open for editing.',
      layout: 'split',
      visual: { kind: 'single', shot: UI.languageStudio },
    },
  ],
};

export { COMMUNITY_GROUP };
