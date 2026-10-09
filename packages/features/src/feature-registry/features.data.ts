/* @layer shared @kind data */
import type { FeatureDef } from '../feature.type';
import { BUNDLE_FIXES } from '../bundle-fixes.generated';
import { AUDIO_FEATURES } from './audio.data';
import { BUG_FIXES_FEATURES } from './bug-fixes.data';
import { DEV_FEATURES } from './dev.data';
import { DISPLAY_FEATURES } from './display.data';
import { GAMEPLAY_FEATURES } from './gameplay.data';
import { HOST_QUERY_FEATURES } from './host-query.data';
import { INPUT_FEATURES } from './input.data';

const FEATURES: FeatureDef[] = [
  ...DISPLAY_FEATURES,
  ...AUDIO_FEATURES,
  ...INPUT_FEATURES,
  ...GAMEPLAY_FEATURES,
  ...BUG_FIXES_FEATURES,
  ...DEV_FEATURES,
  ...HOST_QUERY_FEATURES,
  ...BUNDLE_FIXES,
];

export { FEATURES };
