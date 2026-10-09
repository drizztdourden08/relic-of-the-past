/* @layer store-site @kind logic */
import type { ReviewEntry } from '@rotp/hub-contracts';
import { reviewTargetParam } from '../../api/review-endpoints/review-target-param';
import { SEP } from './review-row.constants';

const entryId = (entry: ReviewEntry): string => `${entry.item.id}${SEP}${reviewTargetParam(entry.target)}`;

export { entryId };
