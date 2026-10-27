/* @layer website-site @kind component */
import { Box, Page, ScrollRail } from '../../design';
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
import { LANDING_TEXT, OBSERVED_IDS, RAIL_MARKS } from './LandingPage.constants';
import './LandingPage.css';

const LandingPage = () => {
  const sectionId = useActiveSection(OBSERVED_IDS);
  const activeId = sectionId === LANDING_TEXT.heroId ? null : sectionId;
  const groupId = groupOfSection(TIMELINE_ENTRIES, activeId);

  return (
    <Page className="landing">
      <Box className="landing__world">
        <WorldBackdrop />
        <Hero />
        <ChapterBar
          groups={FEATURE_GROUPS}
          activeGroupId={groupId}
          onSelect={jumpToSection}
        />
        <Box className="landing__features">
          <ScrollRail
            marks={RAIL_MARKS}
            rangeId={LANDING_TEXT.rangeId}
            activeId={groupId}
            onSelect={jumpToSection}
            ariaLabel={LANDING_TEXT.timeline}
            thumbLabel={LANDING_TEXT.thumb}
          />
          <Box as="main" id={LANDING_TEXT.rangeId} className="landing__rows">
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
    </Page>
  );
};

export { LandingPage };
