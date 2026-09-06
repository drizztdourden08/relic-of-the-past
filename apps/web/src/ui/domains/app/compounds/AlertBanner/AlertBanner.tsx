/* @layer renderer-components @kind component */
/**
 * A standing statement about the settings around it: gold, transparent, one
 * sentence. Bare and presentational.
 *
 * It is deliberately the ONLY banner treatment on this screen. A palette that
 * sorts notices into information, warning and consequence reads as a system
 * to whoever built it and as noise to whoever is using it, and the colour that
 * carries this project is gold, so a notice wears gold and the sentence does
 * the work. The blocking colour stays where it belongs, on a control that
 * cannot be moved.
 */
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
