/* @layer website-site @kind data */
import type { FeatureGroup } from '../feature-group.type';
import { GAME_ICONS } from '../shots/game-icons.constants';
import { NEW_QUEST_SHOTS as SHOTS } from '../shots/new-quest-shots.constants';
import { UI_SHOTS as UI } from '../shots/ui-shots.constants';

const RANDOMIZER_GROUP: FeatureGroup = {
  id: 'new-quest',
  numeral: 'V',
  short: 'A new quest',
  kicker: 'A new quest',
  title: 'A new game every seed',
  accent: 'every seed',
  lead: "Shuffle every item, inspired by the existing randomizers and built on Archipelago's logic, and track every check as you go.",
  glow: 'shop',
  features: [
    {
      id: 'randomizer',
      label: 'Randomizer',
      short: 'Randomizer',
      title: 'Item randomizer',
      promise: ['Inspired by the existing randomizers.', "Built on Archipelago's logic, and going further."],
      body: "Inspired by the existing A Link to the Past randomizers, it builds on Archipelago's logic and expands on many aspects of them. Seeds come from a local port of that logic. Progressive items, shuffled capacity upgrades, and shops that charge in rupees, arrows, bombs or hearts.",
      settings: ['Progressive items', 'Wishing pond'],
      caption: 'The randomizer options and item pool, a shop a seed placed, and the progression items.',
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
      body: 'The Checks tracker lists every chest, key and heart piece, and in a randomized seed it shows what that seed placed.',
      settings: ['Widget'],
      caption: 'The Checks tracker beside the game, and the Eastern Palace opened to show each check and the item placed there.',
      layout: 'split',
      visual: {
        kind: 'collage',
        layers: [
          {
            shot: SHOTS['v-22'],
            slot: 'main',
            depth: 'mid',
            callouts: [
              { x: 37, y: 24, label: 'A chest the tracker counts' },
              { x: 73, y: 58, label: 'Taken, open and left in each world' },
            ],
          },
          { shot: UI.checksOpen, slot: 'bottom-right', depth: 'front' },
        ],
      },
    },
    {
      id: 'multiworld',
      label: 'Archipelago',
      short: 'Multiworld',
      title: 'Archipelago multiworld',
      promise: ['One seed across many games.', "Your items land in your friends' games, theirs in yours."],
      body: 'Join an online Archipelago room from the app and play your part of a shared seed.',
      settings: ['Online room'],
      caption: "The game icons the app shows for items that belong to other players' games, Archipelago itself included.",
      layout: 'split',
      tag: 'in-development',
      visual: { kind: 'icons', icons: GAME_ICONS },
    },
  ],
};

export { RANDOMIZER_GROUP };
