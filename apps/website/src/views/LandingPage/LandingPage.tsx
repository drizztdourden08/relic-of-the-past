/* @layer website-site @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { CommunitySection } from '../../components/CommunitySection';
import { FeatureRow } from '../../components/FeatureRow';
import { Footer } from '../../components/Footer';
import { Hero } from '../../components/Hero';
import { Separator } from '../../components/Separator';
import { FEATURES } from '../../features';
import './LandingPage.css';

const LandingPage = () => (
  <Box className="landing">
    <Hero />
    <Box className="landing__hero-boundary">
      <Separator flush />
    </Box>
    <Box as="main" className="landing__features">
      {FEATURES.map((feature, index) => (
        <FeatureRow key={feature.id} feature={feature} flip={index % 2 === 1} />
      ))}
    </Box>
    <Box className="landing__section-boundary">
      <Separator flush />
    </Box>
    <CommunitySection />
    <Footer />
  </Box>
);

export { LandingPage };
