/* @layer store-site @kind types */
import type { ItemStats } from '@shared/store/types';
import type { Stars as StarCount } from '@shared/store/rating-types';

type RatingPanelProps = {
  stats: ItemStats;
  myRating: StarCount | null;
  blockedReason: string | null;
  note?: string;
  busy: boolean;
  error: string | null;
  onRate: (stars: StarCount) => void;
  onClear: () => void;
};

export type { RatingPanelProps };
