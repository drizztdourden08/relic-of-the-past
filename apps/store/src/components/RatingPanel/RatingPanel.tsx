/* @layer store-site @kind component */
import { useCallback } from 'react';
import { Button, Flex, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { Rating } from '@drizztdourden08/tessera/composites';
import type { Stars } from '@rotp/hub-contracts';
import { averageOf, formatAverage, plural } from '../../format-count';
import { RatingHistogram } from './sub-components/RatingHistogram';
import type { RatingPanelProps } from './RatingPanel.type';
import './RatingPanel.css';

const RatingPanel = (props: RatingPanelProps) => {
  const { stats, myRating, blockedReason, note, busy, error, onRate, onClear } = props;
  const average = averageOf(stats.ratingSum, stats.ratingCount);
  const handleRate = useCallback((picked: number) => onRate(picked as Stars), [onRate]);
  return (
    <Stack gap="md" align="stretch" className="rating-panel">
      <Flex align="center" gap="lg" wrap>
        <Stack gap="xs" align="center" className="rating-panel__summary">
          <Text as="span" className="rating-panel__average">{formatAverage(average)}</Text>
          <Rating value={average} size="lg" />
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
              <Rating value={myRating} size="lg" onChange={handleRate} disabled={busy} />
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
export type { RatingPanelProps } from './RatingPanel.type';
