/* @layer store-site @kind component */
import { useState } from 'react';
import { Box, Icon, Pressable } from '@drizztdourden08/tessera/primitives';
import type { StarsProps } from './Stars.type';
import { COUNTS, STAR_PATH } from './Stars.constants';
import './Stars.css';

const Stars = (props: StarsProps) => {
  const { value, size = 'sm', onChange, disabled = false, className = '' } = props;
  const [hover, setHover] = useState<number | null>(null);
  const filled = Math.round(hover ?? value ?? 0);
  const cls = `stars stars--${size}${className ? ` ${className}` : ''}`;

  if (!onChange) {
    const label = value === null ? 'not rated' : `${value.toFixed(1)} out of 5`;
    return (
      <Box as="span" className={cls} role="img" aria-label={label}>
        {COUNTS.map((n) => <Box as="span" key={n} className="stars__star" data-on={n <= filled || undefined}><Icon path={STAR_PATH} size="1em" /></Box>)}
      </Box>
    );
  }

  return (
    <Box as="span" className={`${cls} stars--picker`} role="group" aria-label="Your rating" onMouseLeave={() => setHover(null)}>
      {COUNTS.map((n) => (
        <Pressable
          key={n}
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
          <Icon path={STAR_PATH} size="1em" />
        </Pressable>
      ))}
    </Box>
  );
};

export { Stars };
export type { StarsProps } from './Stars.type';
