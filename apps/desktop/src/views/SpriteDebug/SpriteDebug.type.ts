/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

type ReviewStatus = 'neutral' | 'good' | 'bad' | 'yellow';
type ReviewMode = 'sprites' | 'items';

interface ReviewEntry {
  status: ReviewStatus;
  comment?: string;
}

type ReviewData = Record<string, ReviewEntry>;

interface SpriteDebugProps {
  romFile: string;
}

interface ReviewHeaderProps {
  counts: { good: number; neutral: number; bad: number; yellow: number };
  total: number;
  filter: 'all' | ReviewStatus;
  setFilter: (v: 'all' | ReviewStatus) => void;
  onReset: () => void;
  tabs?: ReactNode;
}

interface ReviewCardProps {
  entry: ReviewEntry;
  onSetStatus: (s: ReviewStatus) => void;
  onSetComment: (c: string) => void;
  commentPlaceholder: string;
  sprite: ReactNode;
  info: ReactNode;
}

type ReviewSubjectCardProps = Pick<ReviewCardProps, 'entry' | 'onSetStatus' | 'onSetComment'> & { baseUrl: string };

interface UseReviewDataParams {
  load: () => Promise<Record<string, unknown>>;
  save: (data: ReviewData) => Promise<unknown>;
}

export type {
  ReviewStatus,
  ReviewMode,
  ReviewEntry,
  ReviewData,
  ReviewCardProps,
  ReviewHeaderProps,
  ReviewSubjectCardProps,
  SpriteDebugProps,
  UseReviewDataParams,
};
