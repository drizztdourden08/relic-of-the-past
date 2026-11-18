/* @layer renderer-widgets @kind logic */
import type { Message } from '@drizztdourden08/brock-core/i18n';
import { formatDate } from '@drizztdourden08/tessera/primitives';
import type { ReviewMark } from '@rotp/game-data';
import { REVIEW_NEVER } from '../LiveDataInspector.constants';

const reviewStamp = (mark: ReviewMark | undefined, text: (value: Message) => string): string =>
  (mark === undefined ? text(REVIEW_NEVER) : formatDate(mark.at, 'date'));

export { reviewStamp };
