/* @layer renderer-components @kind component */
import { HeroSaveCard } from '../../../compounds/HeroSaveCard';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { formatRelativeTime } from './home-tab/home-tab-helpers';
import { useHomeTabSaves } from './home-tab/useHomeTabSaves';
import { HomeTabColumns } from './home-tab/HomeTabColumns';
import { HomeTabDialogs } from './home-tab/HomeTabDialogs';
import type { HomeTabProps } from './home-tab/home-tab.type';
import './HomeTab.css';

const HomeTab = (props: HomeTabProps) => {
  const { profileId, romFile, isGameRunning, onStartGame, lastPlayed, created, windowMode } = props;
  const saves = useHomeTabSaves({ profileId, isGameRunning, onStartGame });
  const { heroSave, normalScreenshots, busyNormal, handleLoadNormal } = saves;

  return (
    <Box className="home-tab">
      {/* Info cards */}
      <Box className="home-tab__info-cards">
        <Box className="home-tab__info-card">
          <Text className="home-tab__info-label">ROM</Text>
          <Text className="home-tab__info-value">{romFile.replace(/\.(sfc|smc)$/i, '')}</Text>
        </Box>
        <Box className="home-tab__info-card">
          <Text className="home-tab__info-label">Last Played</Text>
          <Text className="home-tab__info-value">{formatRelativeTime(lastPlayed)}</Text>
        </Box>
        <Box className="home-tab__info-card">
          <Text className="home-tab__info-label">Created</Text>
          <Text className="home-tab__info-value">{formatRelativeTime(created)}</Text>
        </Box>
        {windowMode && (
          <Box className="home-tab__info-card">
            <Text className="home-tab__info-label">Window</Text>
            <Text className="home-tab__info-value" style={{ textTransform: 'capitalize' }}>{windowMode}</Text>
          </Box>
        )}
      </Box>

      {/* Hero card — last normal save */}
      {heroSave && (
        <HeroSaveCard
          name={heroSave.name}
          timestamp={heroSave.timestamp}
          screenshotUrl={normalScreenshots[heroSave.id] ?? null}
          onLoad={() => handleLoadNormal(heroSave.id)}
          busy={busyNormal === heroSave.id}
        />
      )}

      <HomeTabColumns saves={saves} isGameRunning={isGameRunning} />
      <HomeTabDialogs saves={saves} />
    </Box>
  );
};

export { HomeTab };
