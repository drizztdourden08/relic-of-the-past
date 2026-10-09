/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives';
import type { AlertBannerProps } from './AlertBanner.type';
import './AlertBanner.css';

const AlertBanner = (props: AlertBannerProps) => {
  const { children, className } = props;

  return (
    <Box className={className === undefined ? 'alert-banner' : `alert-banner ${className}`}>
      {children}
    </Box>
  );
};

export { AlertBanner };
