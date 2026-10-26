/* @layer website-site @kind data */
import type { FeatureGroup } from './feature-group.type';
import { MAKE_IT_YOURS_GROUP } from './groups/make-it-yours.constants';
import { ORIGINAL_GROUP } from './groups/original.constants';
import { RANDOMIZER_GROUP } from './groups/randomizer.constants';
import { SEE_MORE_GROUP } from './groups/see-more.constants';
import { YOUR_WAY_GROUP } from './groups/your-way.constants';

const FEATURE_GROUPS: readonly FeatureGroup[] = [
  ORIGINAL_GROUP,
  SEE_MORE_GROUP,
  YOUR_WAY_GROUP,
  RANDOMIZER_GROUP,
  MAKE_IT_YOURS_GROUP,
];

export { FEATURE_GROUPS };
