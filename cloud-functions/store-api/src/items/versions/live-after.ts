/* @layer store-api @kind logic */
import type { StoreVersion } from '../../../../../shared/store/types';

const liveAfter = (versions: readonly StoreVersion[]): number | null => {
  const live = versions.filter((version) => version.review.state === 'approved' && !version.removed);
  return live.length > 0 ? Math.max(...live.map((version) => version.n)) : null;
};

export { liveAfter };
