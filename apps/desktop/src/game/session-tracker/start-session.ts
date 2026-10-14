/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { endSession } from './end-session';
import { sessionTrackerState } from '@rotp/game-core';

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
};

const startSession = (profileId: string): void => {
  if (sessionTrackerState.activeSession) {
    void endSession();
  }
  const session = {
    id: generateId(),
    profileId,
    startedAt: Date.now(),
  };
  sessionTrackerState.activeSession = session;
  log.app(`[Session] Started session ${session.id} for profile ${profileId}`);
};

export { startSession };
