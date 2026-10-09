/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { catalogApi } from '@drizztdourden08/brock-catalog/renderer';

const useLinkInstall = (onSignedOut: () => void) =>
  useCallback((itemId: string, version: number | null) => {
    void catalogApi()?.install({ itemId, version }).then((result) => {
      if (!result.ok && result.signedOut) onSignedOut();
    });
  }, [onSignedOut]);

export { useLinkInstall };
