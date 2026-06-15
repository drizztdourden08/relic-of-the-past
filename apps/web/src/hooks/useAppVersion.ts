/* @layer renderer-other @kind hook */
import { useEffect, useState } from 'react';

/**
 * Fetches the app version via IPC. Lives in the renderer hooks layer (allowed to
 * use window.api) so presentational components can receive the version as a prop.
 */
const useAppVersion = (): string => {
  const [version, setVersion] = useState('');

  useEffect(() => {
    window.api.updater.getVersion().then(setVersion);
  }, []);

  return version;
};

export { useAppVersion };
