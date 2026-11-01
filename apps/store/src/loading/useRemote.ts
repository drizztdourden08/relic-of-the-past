/* @layer store-site @kind hook */
import { useEffect, useState } from 'react';
import { errorMessage } from '@rotp/hub-client';

const useRemote = <T>(key: string | null, fetchOne: (key: string) => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData(null);
    setError(null);
    if (key === null) return undefined;
    let live = true;
    fetchOne(key).then(
      (response) => { if (live) setData(response); },
      (cause: unknown) => { if (live) setError(errorMessage(cause)); },
    );
    return () => { live = false; };
  }, [key, fetchOne]);

  return { data, error, setData };
};

export { useRemote };
