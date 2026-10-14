/* @layer renderer-components @kind logic */
import { REVIEW_STATUSES } from '../SpriteDebug.constants';
import type { ReviewData, ReviewEntry, ReviewStatus } from '../SpriteDebug.type';

const isStatus = (value: unknown): value is ReviewStatus => REVIEW_STATUSES.some((status) => status === value);

const parseEntry = (value: unknown): ReviewEntry | undefined => {
  if (typeof value !== 'object' || value === null || !('status' in value)) return undefined;
  const { status } = value;
  if (!isStatus(status)) return undefined;
  if ('comment' in value && typeof value.comment === 'string') return { status, comment: value.comment };
  return { status };
};

const parseReviewData = (raw: Record<string, unknown>): ReviewData => {
  const data: ReviewData = {};
  for (const [key, value] of Object.entries(raw)) {
    const entry = parseEntry(value);
    if (entry) data[key] = entry;
  }
  return data;
};

export { parseReviewData };
