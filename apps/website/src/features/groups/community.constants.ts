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
  lead: 'Players make music, outfits and translations and share them. The Hookshop and the Sanctuary are where they meet.',
  glow: 'violet',
  features: [
    {
      id: 'hookshop',
      label: 'Hookshop',
      short: 'Hookshop',
      title: 'The Hookshop',
      promise: ['Community packs,', 'one click away.'],
      body: 'Browse music, sprite and language packs made by players. Install in one click, and share your own.',
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
      promise: ['Where players report and share.', 'Bugs go from the app to the team.'],
      body: 'Players send bug reports from inside the app, with their debug files attached. Reports and shared files can be browsed here.',
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
      body: 'See every pose in every direction. Any compatible sheet works, and .zspr files from the community import too.',
      settings: ['.zspr', 'Palette'],
      caption: 'Link in four directions, and his tile sheet.',
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
      promise: ['Change any text in the game.', 'It warns when a line will not fit.'],
      body: "Edit the game's text line by line and share the result. It renames things too, not only translations.",
      settings: ['Dialogue', 'Terms'],
      caption: 'A line of dialogue open for editing.',
      layout: 'split',
      visual: { kind: 'single', shot: UI.languageStudio },
    },
  ],
};

export { COMMUNITY_GROUP };
