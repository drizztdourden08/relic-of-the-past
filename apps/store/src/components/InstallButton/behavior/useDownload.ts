/* @layer store-site @kind hook */
import { useCallback, useState } from 'react';
import { errorMessage } from '@rotp/hub-client';
import { toast } from '@drizztdourden08/tessera/composites';
import { startDownload } from '../../../lib/start-download';

const useDownload = (itemId: string) => {
  const [busy, setBusy] = useState(false);

  const download = useCallback(async () => {
    setBusy(true);
    try {
      await startDownload(itemId);
    } catch (cause) {
      toast({ message: errorMessage(cause), variant: 'danger' });
    } finally {
      setBusy(false);
    }
  }, [itemId]);

  return { busy, download };
};

export { useDownload };
