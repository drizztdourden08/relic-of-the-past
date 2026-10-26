/* @layer website-site @kind data */
import type { FeatureGroup } from '../feature-group.type';
import { SHOTS } from '../shots.constants';

const YOUR_WAY_GROUP: FeatureGroup = {
  id: 'your-way',
  kicker: 'Your rules',
  title: 'Play it your way',
  lead: 'Any controller, save anywhere, and the quality-of-life switches the original never had.',
  backdrop: SHOTS['sh-09'],
  features: [
    {
      id: 'controllers',
      title: 'Every controller',
      body: 'Xbox, Switch Pro, DualSense and more.',
      shot: SHOTS['sh-08'],
    },
    {
      id: 'save-anywhere',
      title: 'Save anywhere',
      body: 'Quick saves in slots, auto-saves on a timer and on quit, each with a full screenshot.',
      shot: SHOTS['sh-09'],
    },
    {
      id: 'small-fixes',
      title: 'Small fixes, big difference',
      body: 'Turn while dashing, L and R item select, sword pickups, Turbo, a larger wallet.',
      shot: SHOTS['sh-10'],
    },
  ],
};

export { YOUR_WAY_GROUP };
