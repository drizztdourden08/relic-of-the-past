/* @layer renderer-app @kind logic */
import { createContext } from 'react';
import type { GameSessionValue } from '@app/views/GameSession/GameSession.type';

const GameSessionContext = createContext<GameSessionValue | null>(null);

export { GameSessionContext };
