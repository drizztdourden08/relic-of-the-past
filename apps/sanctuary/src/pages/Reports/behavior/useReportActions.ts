/* @layer sanctuary-site @kind hook */
import { useCallback } from 'react';
import { useNoticeRun } from '@rotp/design';
import { deleteReport, downloadReport, extendReport } from '../../../endpoints/reports-endpoints';
import type { UseReportActionsParams } from './useReportActions.type';

const useReportActions = (params: UseReportActionsParams) => {
  const { onExtended, onDeleted } = params;
  const { busy, notice, run } = useNoticeRun();

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
