/* @layer renderer-app @kind hook */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { requireHostApi } from '@drizztdourden08/brock-react';
import type { BugReportSectionProps } from '@drizztdourden08/brock-react';
import type { DebugCaptureSessionSummary } from '@app/debug-report';
import type { RecordingsModel } from '../BugReportRecordings.type';
import { withoutSession } from './without-session';

const unsentKeys = (list: DebugCaptureSessionSummary[]): Set<string> =>
  new Set(list.filter((session) => session.sentAt === null).map((session) => session.sessionKey));

const useRecordings = (profileId: string, setExtras: BugReportSectionProps['setExtras']): RecordingsModel => {
  const [all, setAll] = useState<DebugCaptureSessionSummary[]>([]);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [showSent, setShowSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    void requireHostApi().listDebugCaptureSessions({ profileId }).then((list) => {
      if (!live) return;
      setAll(list);
      setSelected(unsentKeys(list));
      setLoading(false);
    });
    return () => { live = false; };
  }, [profileId]);

  const sessions = useMemo(() => (showSent ? all : all.filter((session) => session.sentAt === null)), [all, showSent]);

  useEffect(() => {
    setExtras({ captureSessions: sessions.filter((session) => selected.has(session.sessionKey)).map((session) => session.sessionKey) });
  }, [sessions, selected, setExtras]);

  const toggleSession = useCallback((sessionKey: string) => {
    setSelected((now) => {
      const next = new Set(now);
      if (!next.delete(sessionKey)) next.add(sessionKey);
      return next;
    });
  }, []);

  const deleteSession = useCallback((sessionKey: string) => {
    setError(null);
    void requireHostApi().deleteDebugCaptureSession({ profileId, sessionKey }).then((result) => {
      if ('error' in result) setError(result.error);
      else setAll((now) => withoutSession(now, sessionKey));
    });
  }, [profileId]);

  return { sessions, loading, selected, showSent, error, toggleSession, toggleShowSent: setShowSent, deleteSession };
};

export { useRecordings };
