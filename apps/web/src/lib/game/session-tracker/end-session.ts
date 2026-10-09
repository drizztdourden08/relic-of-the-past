/* @layer bridge-wasm @kind logic */
import type { PlaySession } from '@shared/types/session';
import { log } from '../../log-bus';
import { saveSession } from '../../storage/profile-data-store';
import { sessionTrackerState } from './session-tracker-state';

const endSession = async (): Promise<PlaySession | null> => {
  const { activeSession } = sessionTrackerState;
  if (!activeSession) return null;

  const now = Date.now();
  const session: PlaySession = {
    id: activeSession.id,
    profileId: activeSession.profileId,
    startedAt: activeSession.startedAt,
    endedAt: now,
    durationMs: now - activeSession.startedAt,
    stats: {},
  };

  log.app(`[Session] Ended session ${session.id} (${Math.round(session.durationMs / 1000)}s)`);
  sessionTrackerState.activeSession = null;

  try {
    await saveSession(session.profileId, session);
  } catch {
    log.error('[Session] Failed to persist session');
  }

  return session;
};

export { endSession };
