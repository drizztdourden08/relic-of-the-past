/* @layer renderer-components @kind component */
import { HeroSaveCard } from '../../../compounds/HeroSaveCard';
import { formatRelativeTime } from './home-tab/home-tab-helpers';
import { useHomeTabSaves } from './home-tab/useHomeTabSaves';
import { HomeTabColumns } from './home-tab/HomeTabColumns';
import { HomeTabDialogs } from './home-tab/HomeTabDialogs';
import type { HomeTabProps } from './home-tab/types';
import './HomeTab.css';

const HomeTab = (props: HomeTabProps) => {
  const { profileId, romFile, isGameRunning, onStartGame, lastPlayed, created, windowMode } = props;
  const saves = useHomeTabSaves({ profileId, isGameRunning, onStartGame });
  const { heroSave, normalScreenshots, busyNormal, handleLoadNormal } = saves;

  return (
    <div className="home-tab">
      {/* Info cards */}
      <div className="home-tab__info-cards">
        <div className="home-tab__info-card">
          <span className="home-tab__info-label">ROM</span>
          <span className="home-tab__info-value">{romFile.replace(/\.(sfc|smc)$/i, '')}</span>
        </div>
        <div className="home-tab__info-card">
          <span className="home-tab__info-label">Last Played</span>
          <span className="home-tab__info-value">{formatRelativeTime(lastPlayed)}</span>
        </div>
        <div className="home-tab__info-card">
          <span className="home-tab__info-label">Created</span>
          <span className="home-tab__info-value">{formatRelativeTime(created)}</span>
        </div>
        {windowMode && (
          <div className="home-tab__info-card">
            <span className="home-tab__info-label">Window</span>
            <span className="home-tab__info-value" style={{ textTransform: 'capitalize' }}>{windowMode}</span>
          </div>
        )}
      </div>

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
    </div>
  );
};

export { HomeTab };
