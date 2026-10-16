/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import type { HeightSwatchProps } from './HeightSwatch.type';

const HeightSwatch = ({ level, className }: HeightSwatchProps) => {
  const style = useMemo(() => ({ opacity: level }), [level]);
  return <Box className={className} style={style} />;
};

export { HeightSwatch };
