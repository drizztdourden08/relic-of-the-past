/* @layer sanctuary-site @kind hook */
/**
 * What the detail pane can do to one report: download its zip, extend it by
 * LIMITS.extendDays, delete it. Each call reports back through `notice`; extend hands
 * the API's record to the list, delete drops the row and closes the pane.
 */
import { useCallback, useState } from 'react';
import { deleteReport, downloadReport, extendReport } from '../../../api/reports-endpoints';
import { errorMessage } from '../../../api/client';
import type { ReportView } from '../../../api/types';

type UseReportActionsParams = {
  onExtended: (report: ReportView) => void;
  onDeleted: (id: string) => void;
};

const useReportActions = (params: UseReportActionsParams) => {
  const { onExtended, onDeleted } = params;
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const run = useCallback(async (work: () => Promise<string | null>) => {
    setBusy(true);
    setNotice(null);
    try {
      setNotice(await work());
    } catch (cause) {
      setNotice(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }, []);

  const download = useCallback((id: string) => run(async () => {
    const { url } = await downloadReport(id);
    window.location.assign(url);
    return null;
  }), [run]);

  const extend = useCallback((id: string) => run(async () => {
    const { report } = await extendReport(id);
    onExtended(report);
    return 'Extended.';
  }), [run, onExtended]);

  const remove = useCallback((id: string) => run(async () => {
    await deleteReport(id);
    onDeleted(id);
    return null;
  }), [run, onDeleted]);

  return { busy, notice, download, extend, remove };
};

type ReportActions = ReturnType<typeof useReportActions>;

export { useReportActions };
export type { ReportActions, UseReportActionsParams };
