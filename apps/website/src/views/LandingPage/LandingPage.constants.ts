/* @layer website-site @kind constants */
import { HERO_ID } from '../../components/Hero';
import { FEATURE_GROUPS, SECTION_IDS } from '../../features';
import { railMarksOf } from './behavior/rail-marks-of';

const LANDING_TEXT = {
  heroId: HERO_ID,
  timeline: 'Features',
  thumb: 'Scroll position',
  rangeId: 'features',
} as const;

const OBSERVED_IDS: readonly string[] = [HERO_ID, ...SECTION_IDS];

const RAIL_MARKS = railMarksOf(FEATURE_GROUPS);

export { LANDING_TEXT, OBSERVED_IDS, RAIL_MARKS };
