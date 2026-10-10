/* @layer store-site @kind logic */
import type { ReviewEntry } from '@rotp/hub-contracts';
import { reviewTargetParam } from '../../endpoints/review-endpoints/review-target-param';
import { SEP } from './review-row.constants';

const entryId = (entry: ReviewEntry): string => `${entry.item.id}${SEP}${reviewTargetParam(entry.target)}`;

export { entryId };
