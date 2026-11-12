/* @layer website-site @kind constants */
import { HERO_ID } from '../../components/Hero';
import { FEATURE_GROUPS, SECTION_IDS } from '../../features';
import { railMarksOf } from './behavior/rail-marks-of';

const LANDING_TEXT = {
  heroId: HERO_ID,
  timeline: 'Features',
  thumb: 'Scroll position',
  rangeId: 'features',
  githubId: 'open-source',
  githubName: 'Open source on GitHub',
} as const;

const GITHUB_ICON_SIZE = 16;

const OBSERVED_IDS: readonly string[] = [HERO_ID, ...SECTION_IDS];

const RAIL_MARKS = railMarksOf(FEATURE_GROUPS);

export { GITHUB_ICON_SIZE, LANDING_TEXT, OBSERVED_IDS, RAIL_MARKS };
