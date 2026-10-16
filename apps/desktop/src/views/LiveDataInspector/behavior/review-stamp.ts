/* @layer renderer-widgets @kind logic */
import { formatDate } from '@drizztdourden08/tessera/primitives';
import type { ReviewMark } from '@rotp/game-data';
import { REVIEW_NEVER } from '../LiveDataInspector.constants';

const reviewStamp = (mark: ReviewMark | undefined): string => (mark === undefined ? REVIEW_NEVER : formatDate(mark.at, 'date'));

export { reviewStamp };
