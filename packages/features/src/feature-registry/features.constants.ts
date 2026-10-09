/* @layer shared @kind data */
import type { FeatureDef } from '../feature.type';
import { BUNDLE_FIXES } from '../bundle-fixes.constants';
import { AUDIO_FEATURES } from './audio.constants';
import { BUG_FIXES_FEATURES } from './bug-fixes.constants';
import { DEV_FEATURES } from './dev.constants';
import { DISPLAY_FEATURES } from './display.constants';
import { GAMEPLAY_FEATURES } from './gameplay.constants';
import { HOST_QUERY_FEATURES } from './host-query.constants';
import { INPUT_FEATURES } from './input.constants';

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
