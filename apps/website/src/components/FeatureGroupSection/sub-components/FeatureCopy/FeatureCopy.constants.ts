/* @layer website-site @kind constants */
import type { FeatureTag } from '../../../../features';

const FEATURE_TAG_LABELS: Readonly<Record<FeatureTag, string>> = {
  experimental: 'Experimental',
  'in-progress': 'In progress',
  'in-development': 'In development',
};

const FEATURE_TAG_COLORS: Readonly<Record<FeatureTag, 'warning' | 'accent'>> = {
  experimental: 'warning',
  'in-progress': 'accent',
  'in-development': 'accent',
};

export { FEATURE_TAG_COLORS, FEATURE_TAG_LABELS };
