/* @layer renderer-app @kind component */
import { useCallback } from 'react';
import { useSettings } from '@drizztdourden08/brock-react';
import type { HeroProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { useGameSession } from '@app/hooks/useGameSession';
import type { AppSettings } from '@app/settings.type';
import { HomeHeroContent } from '@app/views/ProfileHub/sub-components/home-tab/HomeHeroContent';

const meta: ScreenMeta = { title: 'Home', icon: 'house', keywords: ['play', 'start', 'stop', 'reset', 'saves', 'quick save', 'auto save', 'play sessions', 'progress', 'import save'] };

const GameHome = (props: HeroProps) => {
  const { slots } = props;
  const session = useGameSession();
  const { settings } = useSettings<AppSettings>();
  const { game, startGame, resetGame } = session;
  const profile = session.profileMgmt.activeProfile;
  const stopGame = useCallback(() => void game.stop(), [game]);
  if (profile === null) return null;
  return (
    <HomeHeroContent
      slots={slots}
      profile={profile}
      isGameRunning={game.isRunning}
      onStartGame={startGame}
      onStopGame={stopGame}
      onResetGame={resetGame}
      vanillaSafe={settings.vanillaSafe}
    />
  );
};

export default GameHome;
export { meta };
