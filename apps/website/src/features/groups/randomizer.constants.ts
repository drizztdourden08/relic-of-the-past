/* @layer website-site @kind data */
import type { FeatureGroup } from '../feature-group.type';
import { GAME_ICONS } from '../shots/game-icons.constants';
import { NEW_QUEST_SHOTS as SHOTS } from '../shots/new-quest-shots.constants';
import { UI_SHOTS as UI } from '../shots/ui-shots.constants';

const RANDOMIZER_GROUP: FeatureGroup = {
  id: 'new-quest',
  numeral: 'IV',
  short: 'A new quest',
  kicker: 'A new quest',
  title: 'A new game every seed',
  accent: 'every seed',
  lead: "Shuffle every item with Archipelago's own logic, and track every check as you go.",
  glow: 'shop',
  features: [
    {
      id: 'randomizer',
      label: 'Randomizer',
      short: 'Randomizer',
      title: 'Item randomizer',
      promise: ['Every item somewhere new.', "Built on Archipelago's own world logic."],
      body: "Seeds come from a local port of Archipelago's logic. Progressive items, shuffled capacity upgrades, and shops that charge in rupees, arrows, bombs or hearts.",
      settings: ['Randomizer', 'Progressive items', 'Wishing pond'],
      caption: 'The randomizer options and item pool, a shop a seed placed, and the progression items.',
      layout: 'split',
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
      settings: ['Checks widget'],
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
      settings: ['Developer Mode'],
      caption: "The game icons the app shows for items that belong to other players' games, Archipelago itself included.",
      layout: 'split',
      tag: 'experimental',
      visual: { kind: 'icons', icons: GAME_ICONS },
    },
  ],
};

export { RANDOMIZER_GROUP };
