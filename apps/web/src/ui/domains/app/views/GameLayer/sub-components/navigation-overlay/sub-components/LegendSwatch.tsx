/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box } from '@ds/primitives/Box';
import type { LegendSwatchProps } from './LegendSwatch.type';

const LegendSwatch = ({ color, ring, halo }: LegendSwatchProps) => {
  const style = useMemo(() => ({
    width: 8, height: 8, borderRadius: '50%', flexShrink: 0, boxSizing: 'border-box' as const,
    background: ring ? 'transparent' : color,
    border: ring ? `2px solid ${color}` : (halo ? `2px solid ${halo}` : 'none'),
  }), [color, ring, halo]);
  return <Box style={style} />;
};

export { LegendSwatch };
