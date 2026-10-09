/* @layer store-site @kind logic */
import type { ReviewTarget } from '@shared/store/api-types';

const reviewTargetParam = (target: ReviewTarget): string =>
  (target.kind === 'version' ? `v${target.n}` : target.editId);

export { reviewTargetParam };
