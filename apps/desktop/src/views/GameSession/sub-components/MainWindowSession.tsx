/* @layer renderer-app @kind component */
import { GameSessionContext } from '@app/contexts/game-session-context';
import { isMobileHost } from '@app/platform/is-mobile-host';
import { MobileShell } from '@app/views/MobileShell';
import { GameSessionOverlays } from './GameSessionOverlays';
import { useGameSessionValue } from '../behavior/useGameSessionValue';
import type { GameSessionProps } from '../GameSession.type';

const MainWindowSession = (props: GameSessionProps) => {
  const { children } = props;
  const value = useGameSessionValue();
  return (
    <GameSessionContext.Provider value={value}>
      {children}
      <GameSessionOverlays />
      {isMobileHost() && <MobileShell />}
    </GameSessionContext.Provider>
  );
};

export { MainWindowSession };
