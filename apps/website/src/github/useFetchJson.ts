/* @layer website-site @kind hook */
import { useEffect, useState } from 'react';
import type { FetchState } from './fetch-state.type';
import { GITHUB_HEADERS } from './github.constants';

const useFetchJson = <T,>(url: string): FetchState<T> => {
  const [state, setState] = useState<FetchState<T>>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal, headers: GITHUB_HEADERS })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data: T) => setState({ status: 'ready', data }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: 'error' });
      });
    return () => controller.abort();
  }, [url]);

  return state;
};

export { useFetchJson };
