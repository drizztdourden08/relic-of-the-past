/* @layer renderer-widgets @kind types */

type ReviewStatus = 'neutral' | 'good' | 'bad' | 'yellow';
interface ReviewEntry { status: ReviewStatus; comment?: string; }
interface LocationReview { status: ReviewStatus; comment?: string; connections: Record<string, ReviewEntry>; }
type ReviewData = Record<string, LocationReview>;

export type { ReviewStatus, ReviewEntry, LocationReview, ReviewData };
