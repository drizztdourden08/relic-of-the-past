/* @layer renderer-components @kind component */
import type { CSSProperties } from 'react';
import { Box } from '../../../../../../../design-system/primitives/Box';
import { rampColor } from './ramp-color';
import { DEFAULT_CHANGE_SPAN } from './ramp-color.constants';
import type { ByteChangeDotProps } from './ByteChangeDot.type';

const ByteChangeDot = ({ delta, span = DEFAULT_CHANGE_SPAN, signed }: ByteChangeDotProps) => {
  const magnitude = Math.min(1, Math.abs(delta) / span);
  if (magnitude === 0) return null;

  const color = rampColor(magnitude);
  const base: CSSProperties = { background: color, boxShadow: `0 0 4px ${color}` };
  const reach = `max(var(--space-2xs), ${magnitude * 50}%)`;

  const style: CSSProperties = signed
    ? { ...base, ...(delta < 0 ? { right: '50%' } : { left: '50%' }), width: reach }
    : { ...base, left: '50%', width: `max(var(--space-2xs), ${magnitude * 100}%)`, transform: 'translateX(-50%)' };

  return <Box className="hid-cal__byte-change" style={style} aria-hidden />;
};

export { ByteChangeDot };
