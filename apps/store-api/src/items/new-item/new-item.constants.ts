/* @layer store-api @kind constants */
import type { ItemStats } from '@rotp/hub-contracts';

const EMPTY_STATS: ItemStats = {
  installs: 0,
  installs30d: 0,
  ratingCount: 0,
  ratingSum: 0,
  ratingHist: [0, 0, 0, 0, 0],
  score: 0,
};

export { EMPTY_STATS };
