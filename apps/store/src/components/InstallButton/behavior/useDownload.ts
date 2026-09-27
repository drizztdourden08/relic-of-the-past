/* @layer store-site @kind hook */
/** The Download fallback: one request at a time, and the API's refusal kept to show under the buttons. */
import { useCallback, useState } from 'react';
import { errorMessage } from '@site-kit/api/api-error';
import { startDownload } from '../../../lib/start-download';

const useDownload = (itemId: string) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      await startDownload(itemId);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }, [itemId]);

  return { busy, error, download };
};

export { useDownload };
