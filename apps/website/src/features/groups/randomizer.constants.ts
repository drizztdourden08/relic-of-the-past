/* @layer website-site @kind data */
import type { FeatureGroup } from '../feature-group.type';
import { SHOTS } from '../shots.constants';

const RANDOMIZER_GROUP: FeatureGroup = {
  id: 'randomizer',
  kicker: 'A new quest',
  title: 'Randomizer and multiworld',
  lead: "Shuffle every item with Archipelago's own world logic, alone or in a room with friends.",
  backdrop: SHOTS['sh-13'],
  features: [
    {
      id: 'item-randomizer',
      title: 'Item randomizer',
      body: "Seeds from a local port of Archipelago's logic, with progressive items and custom fairies.",
      shot: SHOTS['sh-11'],
    },
    {
      id: 'multiworld',
      title: 'Archipelago multiworld',
      body: 'Join an online room. Shops can charge in rupees, arrows, bombs or hearts.',
      shot: SHOTS['sh-12'],
    },
    {
      id: 'checks-tracker',
      title: 'Track every check',
      body: 'Every chest, key and heart piece.',
      shot: SHOTS['sh-13'],
    },
  ],
};

export { RANDOMIZER_GROUP };
