/* @layer store-site @kind hook */
import { useEffect, useState } from 'react';
import type { AuthorResponse } from '@rotp/hub-contracts';
import { errorMessage } from '@rotp/hub-client';
import { getAuthor } from '../../../endpoints/catalog-endpoints';

const useAuthor = (userId: string) => {
  const [data, setData] = useState<AuthorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData(null);
    setError(null);
    let live = true;
    getAuthor(userId).then(
      (response) => { if (live) setData(response); },
      (cause: unknown) => { if (live) setError(errorMessage(cause)); },
    );
    return () => { live = false; };
  }, [userId]);

  return { data, error };
};

export { useAuthor };
