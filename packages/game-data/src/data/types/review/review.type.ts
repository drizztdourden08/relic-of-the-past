/* @layer shared-game @kind types */
import type { ReviewStatus } from '../../enumeration/enumeration.type';

type ReviewSource = 'person' | 'rom' | 'live';

interface ReviewMark {
  status: ReviewStatus;
  source: ReviewSource;
  note?: string;
  at: string;
}

export type { ReviewMark, ReviewSource, ReviewStatus };
