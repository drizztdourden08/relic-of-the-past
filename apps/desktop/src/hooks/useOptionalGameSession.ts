/* @layer renderer-app @kind hook */
import { useContext } from 'react';
import { GameSessionContext } from '@app/contexts/game-session-context';
import type { GameSessionValue } from '@app/views/GameSession/GameSession.type';

const useOptionalGameSession = (): GameSessionValue | null => useContext(GameSessionContext);

export { useOptionalGameSession };
