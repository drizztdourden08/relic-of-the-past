/* @layer website-site @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { RAY_COUNT } from './HeroRays.constants';
import './HeroRays.css';

const HeroRays = () => (
  <Box className="landing-rays" aria-hidden="true">
    <Box className="landing-rays__glow" />
    {Array.from({ length: RAY_COUNT }, (_, index) => (
      <Box key={index} className={`landing-rays__ray landing-rays__ray--${index + 1}`} />
    ))}
  </Box>
);

export { HeroRays };
