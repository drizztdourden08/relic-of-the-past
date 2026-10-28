/* @layer website-site @kind data */
import type { FeatureGroup } from '../feature-group.type';
import { SEE_MORE_STYLE_FEATURES } from './see-more-style.constants';
import { SEE_MORE_VIEW_FEATURES } from './see-more-view.constants';

const SEE_MORE_GROUP: FeatureGroup = {
  id: 'see-more',
  numeral: 'II',
  short: 'See more',
  kicker: 'The view',
  title: 'See more of Hyrule',
  accent: 'Hyrule',
  lead: 'Wide and tall screens, a HUD that fits and a nicer message box. Each one is a switch.',
  glow: 'castle',
  features: [...SEE_MORE_VIEW_FEATURES, ...SEE_MORE_STYLE_FEATURES],
};

export { SEE_MORE_GROUP };
