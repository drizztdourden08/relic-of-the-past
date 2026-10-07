/* @layer store-site @kind component */
/**
 * Five stars, filled to a rating rounded to the nearest whole star. Read-only by default;
 * with `onChange` each star is a button that sets that many, and hovering previews it.
 */
import { useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import type { Stars as StarCount } from '@shared/store/rating-types';
import './Stars.css';

type StarsProps = {
  /** 0 to 5; null draws five empty stars. */
  value: number | null;
  size?: 'sm' | 'lg';
  /** Makes the stars a picker. */
  onChange?: (stars: StarCount) => void;
  disabled?: boolean;
  className?: string;
};

const COUNTS: readonly StarCount[] = [1, 2, 3, 4, 5];
const STAR = '★';

const Stars = (props: StarsProps) => {
  const { value, size = 'sm', onChange, disabled = false, className = '' } = props;
  const [hover, setHover] = useState<number | null>(null);
  const filled = Math.round(hover ?? value ?? 0);
  const cls = `stars stars--${size}${className ? ` ${className}` : ''}`;

  if (!onChange) {
    const label = value === null ? 'not rated' : `${value.toFixed(1)} out of 5`;
    return (
      <Box as="span" className={cls} role="img" aria-label={label}>
        {COUNTS.map((n) => <Box as="span" key={n} className="stars__star" data-on={n <= filled || undefined}>{STAR}</Box>)}
      </Box>
    );
  }

  return (
    <Box as="span" className={`${cls} stars--picker`} role="group" aria-label="Your rating" onMouseLeave={() => setHover(null)}>
      {COUNTS.map((n) => (
        <Button
          key={n}
          variant="bare"
          className="stars__star"
          data-on={n <= filled || undefined}
          aria-label={n === 1 ? 'Rate 1 star' : `Rate ${n} stars`}
          aria-pressed={value === n}
          disabled={disabled}
          onMouseEnter={() => setHover(n)}
          onFocus={() => setHover(n)}
          onBlur={() => setHover(null)}
          onClick={() => onChange(n)}
        >
          {STAR}
        </Button>
      ))}
    </Box>
  );
};

export { Stars };
export type { StarsProps };
