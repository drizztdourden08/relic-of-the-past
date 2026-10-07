/* @layer renderer-components @kind component */
/**
 * An item's average rating as five stars, read only: rating happens on the Hookshop site.
 * The average is rounded to whole stars for the row and shown to one decimal beside it.
 */
import { Flex, Text } from '@ds/primitives';
import type { StarsProps } from './Stars.type';
import './Stars.css';

const STAR_NUMBERS = [1, 2, 3, 4, 5];
const STAR_GLYPH = '★';

const labelOf = (average: number | null, count: number | undefined): string => {
  if (average === null) return 'No ratings yet';
  const base = `${average.toFixed(1)} out of 5`;
  return count === undefined ? base : `${base} from ${count} ratings`;
};

const Stars = (props: StarsProps) => {
  const { average, count, className = '' } = props;
  const filled = average === null ? 0 : Math.round(average);

  return (
    <Flex inline align="center" gap="xs" className={`stars ${className}`} role="img" aria-label={labelOf(average, count)}>
      <Text as="span" className="stars__row" aria-hidden="true">
        {STAR_NUMBERS.map((n) => (
          <Text as="span" key={n} className={n <= filled ? 'stars__star stars__star--on' : 'stars__star'}>
            {STAR_GLYPH}
          </Text>
        ))}
      </Text>
      {average !== null && <Text as="span" className="stars__value" aria-hidden="true">{average.toFixed(1)}</Text>}
      {average !== null && count !== undefined && (
        <Text as="span" className="stars__count" aria-hidden="true">{count}</Text>
      )}
    </Flex>
  );
};

export { Stars };
