/* @layer store-site @kind hook */
import { useCallback, useState } from 'react';
import { errorMessage } from '@site-kit/api/api-error';
import { showToast } from '@site-kit/toast/toast-store';
import { startDownload } from '../../../lib/start-download';

const useDownload = (itemId: string) => {
  const [busy, setBusy] = useState(false);

  const download = useCallback(async () => {
    setBusy(true);
    try {
      await startDownload(itemId);
    } catch (cause) {
      showToast({ message: errorMessage(cause), variant: 'danger' });
    } finally {
      setBusy(false);
    }
  }, [itemId]);

  return { busy, download };
};

export { useDownload };
