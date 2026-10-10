/* @layer store-site @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { formatCount } from '../../../format-count/format-count';
import type { RatingHistogramProps } from './RatingHistogram.type';
import { STAR_ROWS } from './RatingHistogram.constants';

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
export type { RatingHistogramProps } from './RatingHistogram.type';
