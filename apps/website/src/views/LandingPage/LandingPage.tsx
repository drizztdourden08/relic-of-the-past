/* @layer website-site @kind component */
import { Box, PageRoot } from '@drizztdourden08/tessera/primitives';
import { ClosingCta } from '../../components/ClosingCta';
import { CommunitySection } from '../../components/CommunitySection';
import { FeatureGroupSection } from '../../components/FeatureGroupSection';
import { Footer } from '../../components/Footer';
import { Hero } from '../../components/Hero';
import { Separator } from '../../components/Separator';
import { FEATURE_GROUPS } from '../../features';
import './LandingPage.css';

const LandingPage = () => (
  <PageRoot className="landing">
    <Hero />
    <Box className="landing__hero-boundary">
      <Separator flush />
    </Box>
    <Box as="main" className="landing__features">
      {FEATURE_GROUPS.map((group, index) => (
        <FeatureGroupSection key={group.id} group={group} index={index} />
      ))}
    </Box>
    <Box className="landing__section-boundary">
      <Separator flush />
    </Box>
    <CommunitySection />
    <ClosingCta />
    <Footer />
  </PageRoot>
);

export { LandingPage };
