/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import { inputApi } from '@drizztdourden08/brock-input/renderer';

const useSdlVersion = (): string | null => {
  const [sdlVersion, setSdlVersion] = useState<string | null>(null);
  useEffect(() => {
    inputApi()?.status().then((status) => setSdlVersion(status.sdlVersion)).catch(() => setSdlVersion(null));
  }, []);
  return sdlVersion;
};

export { useSdlVersion };
