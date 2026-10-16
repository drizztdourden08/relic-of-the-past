/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import type { SunkenWellProps } from './SunkenWell.type';
import './SunkenWell.css';

const SunkenWell = (props: SunkenWellProps) => {
  const { children, className } = props;

  return <Box surface="sunken" className={className ? `sunken-well ${className}` : 'sunken-well'}>{children}</Box>;
};

export { SunkenWell };
