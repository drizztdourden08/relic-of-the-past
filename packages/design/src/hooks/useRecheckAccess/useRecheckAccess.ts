/* @layer site-kit @kind hook */
import { useCallback } from 'react';
import { recheckAccess } from '@rotp/hub-client';
import { useSessionContext } from '../../session/session-context';
import { useNoticeRun } from '../useNoticeRun/useNoticeRun';

const useRecheckAccess = () => {
  const { refresh } = useSessionContext();
  const { busy, notice: error, run } = useNoticeRun();

  const recheck = useCallback(() => run(async () => {
    await recheckAccess();
    await refresh();
    return null;
  }), [run, refresh]);

  return { busy, error, recheck };
};

export { useRecheckAccess };
