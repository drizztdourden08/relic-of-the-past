/* @layer store-site @kind hook */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { errorMessage } from '@rotp/hub-client';

const useLoadedList = <T>(fetchAll: () => Promise<T[]>, none: T[]) => {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setItems(await fetchAll());
      setError(null);
    } catch (cause) {
      setError(errorMessage(cause));
      setItems([]);
    }
  }, [fetchAll]);

  useEffect(() => {
    void load();
  }, [load]);

  const view = useMemo(
    () => ({ items: items ?? none, loading: items === null, error, reload: load }),
    [items, none, error, load],
  );

  return { view, setItems };
};

export { useLoadedList };
