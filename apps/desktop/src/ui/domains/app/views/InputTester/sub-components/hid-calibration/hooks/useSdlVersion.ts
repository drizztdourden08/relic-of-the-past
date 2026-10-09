/* @layer renderer-components @kind hook */
import { appApi } from '@app/ipc/app-api';
import { useEffect, useState } from 'react';

const useSdlVersion = (): string | null => {
  const [sdlVersion, setSdlVersion] = useState<string | null>(null);
  useEffect(() => { appApi().sdlVersion().then(setSdlVersion).catch(() => setSdlVersion(null)); }, []);
  return sdlVersion;
};

export { useSdlVersion };
