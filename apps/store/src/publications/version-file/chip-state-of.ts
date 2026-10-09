/* @layer store-site @kind logic */
import type { StoreVersion } from '@shared/store/types';
import type { ReviewChipState } from '../../components/ReviewChip/ReviewChip.type';

const chipStateOf = (version: StoreVersion): ReviewChipState =>
  (version.review.state === 'ready' && version.removed ? 'expired' : version.review.state);

export { chipStateOf };
