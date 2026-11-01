/* @layer website-site @kind data */
import type { FeatureGroup } from '../feature-group.type';
import { GAME_ICONS } from '../shots/game-icons.constants';
import { NEW_QUEST_SHOTS as SHOTS } from '../shots/new-quest-shots.constants';

const RANDOMIZER_GROUP: FeatureGroup = {
  id: 'new-quest',
  numeral: 'V',
  short: 'A new quest',
  kicker: 'A new quest',
  title: 'A new game every seed',
  accent: 'every seed',
  lead: 'Shuffle every item and keep track of every check as you go.',
  glow: 'shop',
  features: [
    {
      id: 'randomizer',
      label: 'Randomizer',
      short: 'Randomizer',
      title: 'Item randomizer',
      promise: ['Inspired by the existing randomizers.', "Built on Archipelago's logic."],
      body: "Progressive items, shuffled upgrades and shops that charge in more than rupees. Seeds come from a local port of Archipelago's logic.",
      settings: ['Progressive items', 'Wishing pond'],
      caption: 'The options, a shop a seed placed, and the progression items.',
      layout: 'split',
      tag: 'in-progress',
      visual: {
        kind: 'collage',
        layers: [
          { shot: SHOTS['v-19'], slot: 'main', depth: 'mid' },
          { shot: SHOTS['v-20'], slot: 'bottom-right', depth: 'front' },
          { shot: SHOTS['v-21'], slot: 'top-right', depth: 'back' },
        ],
      },
    },
    {
      id: 'checks-tracker',
      label: 'Checks tracker',
      short: 'Checks',
      title: 'Track every check',
      promise: ['Know what is left,', 'room by room.'],
      body: 'The Checks tracker lists every chest, key and heart piece. In a randomized seed it shows what was placed there.',
      settings: ['Widget'],
      caption: "The tracker in Zelda's cell, and again in the Eastern Palace.",
      layout: 'split',
      visual: {
        kind: 'collage',
        layers: [
          { shot: SHOTS['tracker-jail'], slot: 'main', depth: 'mid' },
          { shot: SHOTS['tracker-second'], slot: 'bottom-right', depth: 'front' },
        ],
      },
    },
    {
      id: 'multiworld',
      label: 'Archipelago',
      short: 'Multiworld',
      title: 'Archipelago multiworld',
      promise: ['One seed across many games.', "Your items land in your friends' games, theirs in yours."],
      body: 'Join an Archipelago room from the app and play your part of a shared seed.',
      settings: ['Online room'],
      caption: "The icons shown for items that belong to other players' games.",
      layout: 'split',
      tag: 'in-development',
      visual: { kind: 'icons', icons: GAME_ICONS },
    },
  ],
};

export { RANDOMIZER_GROUP };
