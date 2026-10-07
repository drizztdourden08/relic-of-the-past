/* @layer store-site @kind hook */
/**
 * What an author can do from a row: send a ready version for review or resubmit a rejected
 * one, withdraw a waiting one, delete one, and download an approved one. Each change answers
 * with the item, which replaces it in the list.
 */
import { useCallback, useState } from 'react';
import type { StoreItem } from '@shared/store/types';
import { errorMessage } from '@site-kit/api/api-error';
import { abortVersion, deleteVersion, submitVersion, withdrawVersion } from '../../../api/publish-endpoints';
import { useStoreData } from '../../../data/store-data-context';
import { startDownload } from '../../../lib/start-download';

type ItemChange = (itemId: string, n: number) => Promise<{ item: StoreItem }>;

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

type PublicationActions = ReturnType<typeof usePublicationActions>;

export { usePublicationActions };
export type { PublicationActions };
