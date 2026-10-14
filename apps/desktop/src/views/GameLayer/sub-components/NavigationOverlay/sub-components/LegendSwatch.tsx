/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { swatchLook } from '../behavior/swatch-look';
import type { LegendSwatchProps } from './LegendSwatch.type';

const LegendSwatch = ({ color, ring, halo }: LegendSwatchProps) => {
  const look = useMemo(() => swatchLook({ color, ring, halo }), [color, ring, halo]);
  return <Box className={look.className} style={look.style} />;
};

export { LegendSwatch };
