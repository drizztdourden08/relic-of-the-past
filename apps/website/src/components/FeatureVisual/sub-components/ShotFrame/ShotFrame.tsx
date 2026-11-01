/* @layer website-site @kind component */
import { Box } from '../../../../design';
import type { ShotFrameProps } from './ShotFrame.type';
import './ShotFrame.css';

const ShotFrame = ({ caption, framed = true, className, children }: ShotFrameProps) => (
  <Box as="figure" className={className ? `shot-frame ${className}` : 'shot-frame'}>
    <Box className={framed ? 'shot-frame__stage shot-frame__stage--framed' : 'shot-frame__stage'}>{children}</Box>
    <Box as="figcaption" className="shot-frame__caption">
      {caption}
    </Box>
  </Box>
);

export { ShotFrame };
