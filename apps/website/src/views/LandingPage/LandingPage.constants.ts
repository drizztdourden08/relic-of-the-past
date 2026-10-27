/* @layer website-site @kind constants */
import { HERO_ID } from '../../components/Hero';
import { SECTION_IDS } from '../../features';

const LANDING_TEXT = {
  heroId: HERO_ID,
  timeline: 'Features',
} as const;

const OBSERVED_IDS: readonly string[] = [HERO_ID, ...SECTION_IDS];

export { LANDING_TEXT, OBSERVED_IDS };
