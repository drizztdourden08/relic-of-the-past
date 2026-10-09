/* @layer renderer-appshell @kind hook */
import { useEffect } from 'react';
import { nav } from '@drizztdourden08/brock-react';
import { appApi } from '@app/ipc/app-api';
import { useStoreLinkStore } from '@app/stores/store-link';

const useStoreLinks = (): void => {
  const offer = useStoreLinkStore((s) => s.offer);

  useEffect(() => {
    const unsubscribe = appApi().onStoreOpenInstall?.((link) => {
      offer(link);
      nav.open('store');
    });
    return () => { unsubscribe?.(); };
  }, [offer]);
};

export { useStoreLinks };
