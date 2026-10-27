/* @layer website-site @kind component */
import { Box, PageRoot } from '@drizztdourden08/tessera/primitives';
import { ChapterBar } from '../../components/ChapterBar';
import { CommunitySection } from '../../components/CommunitySection';
import { FeatureGroupSection } from '../../components/FeatureGroupSection';
import { Footer } from '../../components/Footer';
import { Hero } from '../../components/Hero';
import { Separator } from '../../components/Separator';
import { WorldBackdrop } from '../../components/WorldBackdrop';
import { FEATURE_GROUPS, groupOfSection, TIMELINE_ENTRIES } from '../../features';
import { jumpToSection } from './behavior/jump-to-section';
import { useActiveSection } from './behavior/useActiveSection';
import { TimelineSlot } from './sub-components/TimelineSlot';
import { LANDING_TEXT, OBSERVED_IDS } from './LandingPage.constants';
import './LandingPage.css';

const LandingPage = () => {
  const sectionId = useActiveSection(OBSERVED_IDS);
  const activeId = sectionId === LANDING_TEXT.heroId ? null : sectionId;

  return (
    <PageRoot className="landing">
      <Box className="landing__world">
        <WorldBackdrop />
        <Hero />
        <ChapterBar
          groups={FEATURE_GROUPS}
          activeGroupId={groupOfSection(TIMELINE_ENTRIES, activeId)}
          onSelect={jumpToSection}
        />
        <Box className="landing__features">
          <TimelineSlot entries={TIMELINE_ENTRIES} activeId={activeId} ariaLabel={LANDING_TEXT.timeline} onJump={jumpToSection} />
          <Box as="main" className="landing__rows">
            {FEATURE_GROUPS.map((group) => (
              <FeatureGroupSection key={group.id} group={group} />
            ))}
          </Box>
        </Box>
      </Box>
      <Box className="landing__section-boundary">
        <Separator flush />
      </Box>
      <CommunitySection />
      <Footer />
    </PageRoot>
  );
};

export { LandingPage };
