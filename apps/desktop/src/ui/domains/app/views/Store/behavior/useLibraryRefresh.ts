/* @layer renderer-components @kind hook */
import { useEffect } from 'react';
import { catalogApi } from '@drizztdourden08/brock-catalog/renderer';

const useLibraryRefresh = (onLibraryChanged: () => unknown): void => {
  useEffect(() => catalogApi()?.onChanged(() => { void onLibraryChanged(); }), [onLibraryChanged]);
};

export { useLibraryRefresh };
