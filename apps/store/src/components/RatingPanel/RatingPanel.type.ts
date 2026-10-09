/* @layer store-site @kind types */
import type { ItemStats } from '@rotp/hub-contracts';
import type { Stars as StarCount } from '@rotp/hub-contracts';

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
