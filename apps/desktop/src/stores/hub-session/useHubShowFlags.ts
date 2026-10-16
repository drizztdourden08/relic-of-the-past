/* @layer renderer-stores @kind hook */
import { useEffect, useMemo } from 'react';
import type { ShowFlagValues } from '@drizztdourden08/brock-react';
import { selectSignedIn } from './select-signed-in';
import { useHubSessionStore } from './useHubSessionStore';

const useHubShowFlags = (): ShowFlagValues => {
  const signedIn = useHubSessionStore(selectSignedIn);
  const refresh = useHubSessionStore((s) => s.refresh);

  useEffect(() => { void refresh(); }, [refresh]);

  return useMemo(() => ({ signedIn }), [signedIn]);
};

export { useHubShowFlags };
