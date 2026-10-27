/* @layer website-site @kind component */
import { Box, Flex, Icon, Link, P, Title } from '../../design';
import { useContributors, useGitHubStats } from '../../github';
import { REPO_HOME_URL } from '../../repo';
import { COMMUNITY_TEXT } from './CommunitySection.constants';
import { CommunityStats } from './sub-components/CommunityStats';
import { CommunityTexture } from './sub-components/CommunityTexture';
import { ContributorList } from './sub-components/ContributorList';
import './CommunitySection.css';

const CommunitySection = () => {
  const stats = useGitHubStats();
  const contributors = useContributors();

  return (
    <Box as="section" className="landing-community">
      <CommunityTexture />
      <Flex direction="column" align="center" className="landing-community__inner">
        <Title level={2} tone="secondary" className="landing-community__title">
          {COMMUNITY_TEXT.title}
        </Title>
        <P className="landing-community__blurb">{COMMUNITY_TEXT.blurb}</P>
        {stats && <CommunityStats stats={stats} />}
        <ContributorList contributors={contributors} />
        <Link href={REPO_HOME_URL} className="landing-community__github">
          <Icon name="github" />
          {COMMUNITY_TEXT.viewOnGitHub}
        </Link>
      </Flex>
    </Box>
  );
};

export { CommunitySection };
