/* @layer store-site @kind logic */
import type { ReviewEntry } from '@shared/store/api-types';
import { reviewTargetParam } from '../../api/review-endpoints/review-target-param';
import { SEP } from './review-row.constants';

const entryId = (entry: ReviewEntry): string => `${entry.item.id}${SEP}${reviewTargetParam(entry.target)}`;

export { entryId };
