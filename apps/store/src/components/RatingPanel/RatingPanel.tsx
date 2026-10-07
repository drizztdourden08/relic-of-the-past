/* @layer store-site @kind component */
/**
 * An item's ratings: the average in large type with its stars and count, the spread by
 * star, then the player's own stars. The picker is live only when the host says the player
 * may rate; otherwise the reason stands in its place.
 */
import { Button } from '@ds/primitives/Button';
import { Flex } from '@ds/primitives/Flex';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import type { ItemStats } from '@shared/store/types';
import type { Stars as StarCount } from '@shared/store/rating-types';
import { averageOf, formatAverage, plural } from '../../lib/format-count';
import { Stars } from '../Stars/Stars';
import { RatingHistogram } from './sub-components/RatingHistogram';
import './RatingPanel.css';

type RatingPanelProps = {
  stats: ItemStats;
  myRating: StarCount | null;
  /** Null when the player may rate; otherwise why they cannot, shown in place of the picker. */
  blockedReason: string | null;
  /** A line under the picker, such as when they installed it. */
  note?: string;
  busy: boolean;
  error: string | null;
  onRate: (stars: StarCount) => void;
  onClear: () => void;
};

const RatingPanel = (props: RatingPanelProps) => {
  const { stats, myRating, blockedReason, note, busy, error, onRate, onClear } = props;
  const average = averageOf(stats.ratingSum, stats.ratingCount);
  return (
    <Stack gap="md" align="stretch" className="rating-panel">
      <Flex align="center" gap="lg" wrap>
        <Stack gap="xs" align="center" className="rating-panel__summary">
          <Text as="span" className="rating-panel__average">{formatAverage(average)}</Text>
          <Stars value={average} size="lg" />
          <Text as="span" variant="caption">{plural(stats.ratingCount, 'rating', 'ratings')}</Text>
        </Stack>
        <RatingHistogram hist={stats.ratingHist} />
      </Flex>
      <Stack gap="xs" align="stretch" className="rating-panel__mine">
        <Text as="span" variant="label">Your rating</Text>
        {blockedReason
          ? <Text as="p" variant="caption">{blockedReason}</Text>
          : (
            <Flex align="center" gap="md" wrap>
              <Stars value={myRating} size="lg" onChange={onRate} disabled={busy} />
              {myRating !== null && <Button variant="ghost" size="sm" disabled={busy} onClick={onClear}>Remove my rating</Button>}
            </Flex>
          )}
        {note && !blockedReason && <Text as="p" variant="caption">{note}</Text>}
        {error && <Text as="p" variant="caption" role="alert">{error}</Text>}
      </Stack>
    </Stack>
  );
};

export { RatingPanel };
export type { RatingPanelProps };
