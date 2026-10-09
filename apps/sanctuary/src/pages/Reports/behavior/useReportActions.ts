/* @layer sanctuary-site @kind hook */
import { useCallback, useState } from 'react';
import { deleteReport, downloadReport, extendReport } from '../../../api/reports-endpoints';
import { errorMessage } from '@rotp/hub-client';
import type { UseReportActionsParams } from './useReportActions.type';

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

export { useReportActions };
