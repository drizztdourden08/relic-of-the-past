/* @layer store-site @kind component */
/** The spread of ratings: one bar per star count, five at the top, each as long as its share. */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import type { ItemStats } from '@shared/store/types';
import { formatCount } from '../../../lib/format-count';

type RatingHistogramProps = { hist: ItemStats['ratingHist'] };

const STAR_ROWS = [5, 4, 3, 2, 1] as const;

const RatingHistogram = (props: RatingHistogramProps) => {
  const { hist } = props;
  const top = Math.max(1, ...hist);
  return (
    <Box className="rating-histogram" role="list" aria-label="Ratings by stars">
      {STAR_ROWS.map((stars) => {
        const count = hist[stars - 1];
        return (
          <Box key={stars} className="rating-histogram__row" role="listitem" aria-label={`${stars} stars: ${count}`}>
            <Text as="span" variant="caption" className="rating-histogram__stars">{stars}</Text>
            <Box className="rating-histogram__track">
              <Box className="rating-histogram__bar" style={{ width: `${(count / top) * 100}%` }} />
            </Box>
            <Text as="span" variant="caption" className="rating-histogram__count">{formatCount(count)}</Text>
          </Box>
        );
      })}
    </Box>
  );
};

export { RatingHistogram };
export type { RatingHistogramProps };
