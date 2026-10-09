/* @layer renderer-components @kind component */
import { Flex, Text } from '@drizztdourden08/tessera/primitives';
import { STAR_GLYPH, STAR_NUMBERS } from './Stars.constants';
import type { StarsProps } from './Stars.type';
import './Stars.css';

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
