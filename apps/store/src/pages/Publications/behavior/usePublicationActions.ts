/* @layer store-site @kind hook */
import { useCallback, useState } from 'react';
import { errorMessage } from '@rotp/hub-client';
import { abortVersion, deleteVersion, submitVersion, withdrawVersion } from '../../../endpoints/publish-endpoints';
import { useStoreData } from '../../../data/store-data-context';
import { startDownload } from '../../../lib/start-download';
import type { ItemChange } from './usePublicationActions.type';

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

  const change = useCallback((call: ItemChange, done: string) => (itemId: string, n: number) => run(async () => {
    onItem((await call(itemId, n)).item);
    setNotice(done);
  }), [run, onItem]);

  const submit = useCallback(
    (itemId: string, n: number) => change(submitVersion, 'Sent for review. It waits in the queue.')(itemId, n),
    [change],
  );

  const withdraw = useCallback(
    (itemId: string, n: number) => change(withdrawVersion, 'Withdrawn. The version is ready again; send it when you want.')(itemId, n),
    [change],
  );

  const remove = useCallback(
    (itemId: string, n: number) => change(deleteVersion, 'Deleted. The file was removed; the row stays in your history.')(itemId, n),
    [change],
  );

  const abort = useCallback(
    (itemId: string, n: number) => change(abortVersion, 'Upload cancelled. The row stays in your history.')(itemId, n),
    [change],
  );

  const download = useCallback((itemId: string, n: number) => run(async () => {
    await startDownload(itemId, n);
  }), [run]);

  return { busy, notice, submit, withdraw, remove, abort, download };
};

export { usePublicationActions };
