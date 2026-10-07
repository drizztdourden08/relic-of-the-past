/* @layer sanctuary-site @kind hook */
/**
 * Every report, loaded once by the signed-in frame; an extend replaces its row, a delete
 * drops it. Without the reports right nothing is fetched and the list stays empty.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { listReports } from '../api/reports-endpoints';
import { errorMessage } from '../api/client';
import type { ReportView } from '../api/types';

const NO_REPORTS: ReportView[] = [];

const byNewest = (a: ReportView, b: ReportView) => b.createdAt - a.createdAt;

const useReports = (enabled: boolean) => {
  const [reports, setReports] = useState<ReportView[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) {
      setReports(NO_REPORTS);
      setError(null);
      return;
    }
    try {
      const { reports: rows } = await listReports();
      setReports([...rows].sort(byNewest));
      setError(null);
    } catch (cause) {
      setError(errorMessage(cause));
      setReports([]);
    }
  }, [enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  const replace = useCallback((report: ReportView) => {
    setReports((rows) => (rows ?? []).map((row) => (row.id === report.id ? report : row)));
  }, []);

  const remove = useCallback((id: string) => {
    setReports((rows) => (rows ?? []).filter((row) => row.id !== id));
  }, []);

  return useMemo(
    () => ({ reports: reports ?? NO_REPORTS, loading: reports === null, error, reload: load, replace, remove }),
    [reports, error, load, replace, remove],
  );
};

export { useReports };
