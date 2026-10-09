/* @layer store-api @kind logic */
import type { ReviewTarget } from '../../../../../shared/store/api-types';

const formatTarget = (target: ReviewTarget): string => (target.kind === 'version' ? `v${target.n}` : target.editId);

export { formatTarget };
