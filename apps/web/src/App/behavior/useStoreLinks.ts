/* @layer renderer-appshell @kind hook */
import { useEffect } from 'react';
import { useStoreLinkStore } from '@app/stores/store-link';
import type { PageId } from '../App.type';

const useStoreLinks = (setActivePage: (page: PageId) => void): void => {
  const offer = useStoreLinkStore((s) => s.offer);

  useEffect(() => {
    const unsubscribe = window.api.onStoreOpenInstall?.((link) => {
      offer(link);
      setActivePage('store');
    });
    return () => { unsubscribe?.(); };
  }, [offer, setActivePage]);
};

export { useStoreLinks };
