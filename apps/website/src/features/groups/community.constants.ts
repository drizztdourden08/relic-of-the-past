/* @layer website-site @kind data */
import type { FeatureGroup } from '../feature-group.type';
import { UI_SHOTS as UI } from '../shots/ui-shots.constants';

const COMMUNITY_GROUP: FeatureGroup = {
  id: 'community',
  numeral: 'VI',
  short: 'Community',
  kicker: 'The community',
  title: 'Made by players, shared with players',
  accent: 'players',
  lead: 'Players make music, outfits and translations, and share them. The Hookshop and the Sanctuary are where they meet, and two studios in the app are where outfits and translations are made.',
  glow: 'violet',
  features: [
    {
      id: 'hookshop',
      label: 'Hookshop',
      short: 'Hookshop',
      title: 'The Hookshop',
      promise: ['Community packs,', 'one click away.'],
      body: 'Browse music, sprite and language packs made by players, install them in one click, and share your own.',
      settings: ['Packs'],
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
      id: 'sprite-studio',
      label: 'Player Sprite Studio',
      short: 'Sprite Studio',
      title: 'Player Sprite Studio',
      promise: ['Any compatible sprite sheet,', 'not only Link.'],
      body: 'The Player Sprite Studio shows every pose in every direction. Any compatible sprite sheet in the right format works, not just Link, and it imports .zspr sheets so outfits from the wider community work here too.',
      settings: ['.zspr', 'Palette'],
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
      promise: ['Change any text in the game.', 'The studio warns when a line will not fit.'],
      body: "Language Studio edits the game's text line by line and warns when a line will not fit in its box. Any text in the game can be changed, so it also renames terms found in the game, not only translations, and the result can be shared.",
      settings: ['Dialogue', 'Terms'],
      caption: 'The Language Studio with a line of dialogue open for editing.',
      layout: 'split',
      visual: { kind: 'single', shot: UI.languageStudio },
    },
  ],
};

export { COMMUNITY_GROUP };
