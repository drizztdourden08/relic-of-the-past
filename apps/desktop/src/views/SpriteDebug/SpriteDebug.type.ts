/* @layer renderer-components @kind types */
type ReviewStatus = 'neutral' | 'good' | 'bad' | 'yellow';
type ReviewMode = 'sprites' | 'items';

interface ReviewEntry {
  status: ReviewStatus;
  comment?: string;
}

type ReviewData = Record<string, ReviewEntry>;

interface SpriteDebugProps {
  onClose: () => void;
  romFile: string;
}

interface UseReviewDataParams {
  load: () => Promise<Record<string, unknown>>;
  save: (data: ReviewData) => Promise<unknown>;
}

export type {
  ReviewStatus,
  ReviewMode,
  ReviewEntry,
  ReviewData,
  SpriteDebugProps,
  UseReviewDataParams,
};
