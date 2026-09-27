/* @layer renderer-appshell @kind hook */
/**
 * A rotp://install link the browser opened lands on the Hookshop tab whatever page was open:
 * the link waits in the link store and the tab installs it. No-op off Electron.
 */
import { useEffect } from 'react';
import { useStoreLinkStore } from '@app/stores/store-link';
import type { PageId } from '../types';

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
