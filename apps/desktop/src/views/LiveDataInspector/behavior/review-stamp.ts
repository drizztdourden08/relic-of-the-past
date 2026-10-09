/* @layer renderer-widgets @kind logic */
import type { ReviewMark } from '@rotp/game-data';
import { REVIEW_NEVER } from '../LiveDataInspector.constants';

const reviewStamp = (mark: ReviewMark | undefined): string =>
  (mark === undefined ? REVIEW_NEVER : new Date(mark.at).toLocaleDateString());

export { reviewStamp };
