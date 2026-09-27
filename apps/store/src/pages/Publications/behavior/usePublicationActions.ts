/* @layer store-site @kind hook */
/**
 * What an author can do from a row: withdraw a waiting version, and download an approved
 * one. A withdraw answers with the item, which replaces it in the list.
 */
import { useCallback, useState } from 'react';
import { errorMessage } from '@site-kit/api/api-error';
import { withdrawVersion } from '../../../api/publish-endpoints';
import { useStoreData } from '../../../data/store-data-context';
import { startDownload } from '../../../lib/start-download';

const usePublicationActions = () => {
  const { onItem } = useStoreData();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const run = useCallback(async (work: () => Promise<void>) => {
    setBusy(true);
    setNotice(null);
    try {
      await work();
    } catch (cause) {
      setNotice(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }, []);

  const withdraw = useCallback((itemId: string, n: number) => run(async () => {
    onItem((await withdrawVersion(itemId, n)).item);
    setNotice('Withdrawn. The version left the review queue.');
  }), [run, onItem]);

  const download = useCallback((itemId: string, n: number) => run(async () => {
    await startDownload(itemId, n);
  }), [run]);

  return { busy, notice, withdraw, download };
};

type PublicationActions = ReturnType<typeof usePublicationActions>;

export { usePublicationActions };
export type { PublicationActions };
