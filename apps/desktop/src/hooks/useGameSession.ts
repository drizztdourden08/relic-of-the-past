/* @layer renderer-app @kind hook */
import { useContext } from 'react';
import { GameSessionContext } from '@app/contexts/game-session-context';
import type { GameSessionValue } from '@app/views/GameSession/GameSession.type';

const useGameSession = (): GameSessionValue => {
  const session = useContext(GameSessionContext);
  if (!session) throw new Error('useGameSession must be used inside the main window');
  return session;
};

export { useGameSession };
