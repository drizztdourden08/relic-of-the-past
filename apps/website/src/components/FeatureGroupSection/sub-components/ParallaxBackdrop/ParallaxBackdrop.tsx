/* @layer website-site @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { ShotImage } from '../../../ShotImage';
import type { ParallaxBackdropProps } from './ParallaxBackdrop.type';
import './ParallaxBackdrop.css';

const ParallaxBackdrop = ({ shot }: ParallaxBackdropProps) => (
  <Box className="parallax-backdrop" aria-hidden="true">
    <ShotImage shot={shot} className="parallax-backdrop__shot" />
  </Box>
);

export { ParallaxBackdrop };
