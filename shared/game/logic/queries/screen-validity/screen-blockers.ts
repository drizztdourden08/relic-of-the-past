/* @layer shared-game @kind logic */
import { geographyBlockers } from './geography-blockers';
import { homeBlockers } from './home-blockers';
import { indexBlockers } from './index-blockers';
import type { ScreenCandidate } from './screen-validity.type';
import { variantBlockers } from './variant-blockers';

const screenBlockers = (candidate: ScreenCandidate): readonly string[] => [
  ...indexBlockers(candidate),
  ...geographyBlockers(candidate),
  ...homeBlockers(candidate),
  ...variantBlockers(candidate),
];

export { screenBlockers };
