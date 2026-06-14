/* @layer bridge-wasm @kind logic */
/**
 * Session Tracker — records play sessions (start/end/duration).
 * Foundation for future per-session stats tracking.
 */

import type { PlaySession } from '@shared/types/session';
import { log } from '../log-bus';
import { saveSession, listSessions as listSessionsStore } from '../storage/profile-data-store';

let activeSession: { id: string; profileId: string; startedAt: number } | null = null;

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
};

const startSession = (profileId: string): void => {
  if (activeSession) {
    endSession();
  }
  activeSession = {
    id: generateId(),
    profileId,
    startedAt: Date.now(),
  };
  log.app(`[Session] Started session ${activeSession.id} for profile ${profileId}`);
};

const endSession = async (): Promise<PlaySession | null> => {
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
  activeSession = null;

  try {
    await saveSession(session.profileId, session);
  } catch {
    log.error('[Session] Failed to persist session');
  }

  return session;
};

const getActiveSession = () => {
  return activeSession;
};

const listSessions = async (profileId: string): Promise<PlaySession[]> => {
  try {
    return await listSessionsStore(profileId);
  } catch {
    return [];
  }
};

export {
  endSession,
  getActiveSession,
  listSessions,
  startSession
};
