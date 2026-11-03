/* @layer site-kit @kind hook */
import { useCallback, useState } from 'react';
import { errorMessage } from '@rotp/hub-client';

const useNoticeRun = () => {
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

  return { busy, notice, setNotice, run };
};

export { useNoticeRun };
