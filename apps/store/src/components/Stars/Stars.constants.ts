/* @layer store-site @kind constants */
import type { IconPath } from '@drizztdourden08/tessera/primitives';
import type { Stars as StarCount } from '@rotp/hub-contracts';

const COUNTS: readonly StarCount[] = [1, 2, 3, 4, 5];
const STAR_PATH: IconPath = {
  d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z',
  viewBox: '0 0 24 24',
};

export { COUNTS, STAR_PATH };
