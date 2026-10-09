/* @layer renderer-other @kind hook */
import { useEffect, useState } from 'react';

const useAppVersion = (): string => {
  const [version, setVersion] = useState('');

  useEffect(() => {
    window.api.updater.getVersion().then(setVersion);
  }, []);

  return version;
};

export { useAppVersion };
