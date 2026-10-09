/* @layer store-site @kind component */
import { Button } from '@ds/primitives/Button';
import { Flex } from '@ds/primitives/Flex';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { averageOf, formatAverage, plural } from '../../lib/format-count';
import { Stars } from '../Stars/Stars';
import { RatingHistogram } from './sub-components/RatingHistogram';
import type { RatingPanelProps } from './RatingPanel.type';
import './RatingPanel.css';

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
export type { RatingPanelProps } from './RatingPanel.type';
