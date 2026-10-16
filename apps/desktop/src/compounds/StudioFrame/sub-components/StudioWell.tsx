/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import type { StudioWellProps } from '../StudioFrame.type';

const StudioWell = (props: StudioWellProps) => {
  const { children, className } = props;

  return <Box surface="sunken" className={`studio-frame__well${className ? ` ${className}` : ''}`}>{children}</Box>;
};

export { StudioWell };
