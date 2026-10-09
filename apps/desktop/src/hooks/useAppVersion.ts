/* @layer renderer-other @kind hook */
import { appApi } from '@app/ipc/app-api';
import { useEffect, useState } from 'react';

const useAppVersion = (): string => {
  const [version, setVersion] = useState('');

  useEffect(() => {
    appApi().updater.getVersion().then(setVersion);
  }, []);

  return version;
};

export { useAppVersion };
