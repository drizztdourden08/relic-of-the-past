/* @layer website-site @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { FeatureCard } from '../FeatureCard';
import type { FeatureTrackProps } from './FeatureTrack.type';
import './FeatureTrack.css';

const FeatureTrack = ({ features }: FeatureTrackProps) => (
  <Box className="feature-track-clip">
    <Box as="ul" className="feature-track">
      {features.map((feature) => (
        <FeatureCard key={feature.id} feature={feature} />
      ))}
    </Box>
  </Box>
);

export { FeatureTrack };
