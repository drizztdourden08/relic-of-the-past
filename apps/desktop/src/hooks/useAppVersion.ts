/* @layer renderer-other @kind hook */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { useEffect, useState } from 'react';

const useAppVersion = (): string => {
  const [version, setVersion] = useState('');

  useEffect(() => {
    void requireHostApi().getAppVersion().then(setVersion);
  }, []);

  return version;
};

export { useAppVersion };
