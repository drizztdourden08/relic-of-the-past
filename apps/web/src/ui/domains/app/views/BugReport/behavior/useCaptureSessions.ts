/* @layer renderer-components @kind hook */
/** Lists a profile's recorded capture sessions for the picker, owns which ones are checked,
 *  and deletes one on request. Every load re-defaults selection: unsent sessions start
 *  checked, already-sent ones don't - "new" always means unsent, never "since I last looked".
 *  Deletion goes straight to disk (the picker itself gets the user's confirmation first, since
 *  that's presentational). `profileId === null` (debug logging off, or no active profile)
 *  means there's nothing to attach: the list stays empty and nothing here calls window.api. */
import { useCallback, useEffect, useState } from 'react';
import type { DebugCaptureSessionSummary } from '@shared/types/debug-report';

const useCaptureSessions = (profileId: string | null, open: boolean) => {
  const [sessions, setSessions] = useState<DebugCaptureSessionSummary[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showSent, setShowSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!profileId) {
      setSessions([]);
      setSelected(new Set());
      return;
    }
    setLoading(true);
    try {
      const list = await window.api.listDebugCaptureSessions({ profileId });
      setSessions(list);
      setSelected(new Set(list.filter((s) => s.sentAt == null).map((s) => s.sessionKey)));
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    if (!open) return;
    void refresh();
  }, [open, refresh]);

  const toggleSession = useCallback((sessionKey: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(sessionKey)) next.delete(sessionKey); else next.add(sessionKey);
      return next;
    });
  }, []);

  const toggleShowSent = useCallback(() => setShowSent((prev) => !prev), []);

  const deleteSession = useCallback(async (sessionKey: string) => {
    if (!profileId) return;
    setDeleteError(null);
    const result = await window.api.deleteDebugCaptureSession({ profileId, sessionKey });
    if ('error' in result) {
      setDeleteError(result.error);
      return;
    }
    setSessions((prev) => prev.filter((s) => s.sessionKey !== sessionKey));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(sessionKey);
      return next;
    });
  }, [profileId]);

  const visibleSessions = showSent ? sessions : sessions.filter((s) => s.sentAt == null);

  return {
    sessions: visibleSessions,
    loading,
    selected,
    showSent,
    deleteError,
    toggleSession,
    toggleShowSent,
    deleteSession,
    selectedSessionKeys: Array.from(selected),
  };
};

export { useCaptureSessions };
