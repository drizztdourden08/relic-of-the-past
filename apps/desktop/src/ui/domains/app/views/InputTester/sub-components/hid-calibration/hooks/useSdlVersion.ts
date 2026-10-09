/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';

const useSdlVersion = (): string | null => {
  const [sdlVersion, setSdlVersion] = useState<string | null>(null);
  useEffect(() => { window.api.sdlVersion().then(setSdlVersion).catch(() => setSdlVersion(null)); }, []);
  return sdlVersion;
};

export { useSdlVersion };
