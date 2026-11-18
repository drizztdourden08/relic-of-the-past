/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { useT } from '@drizztdourden08/brock-react';
import { PlaySessionCard } from '../../../../../compounds/PlaySessionCard';
import type { HomeTabColumnsProps } from '../home-tab.type';

const PlaySessionsSection = ({ saves }: HomeTabColumnsProps) => {
  const t = useT();
  const { sessions } = saves;
  return (
    <Box as="section" className="home-tab__section">
      <Text as="h3" className="home-tab__section-title">{t('profiles:home.sessions.title')}</Text>
      {sessions.length === 0 ? (
        <Text as="p" className="home-tab__empty">{t('profiles:home.sessions.empty')}</Text>
      ) : (
        <Box className="home-tab__sessions">
          {sessions.map((s) => (
            <PlaySessionCard key={s.id} session={s} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export { PlaySessionsSection };
