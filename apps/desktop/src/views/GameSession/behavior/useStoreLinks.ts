/* @layer renderer-appshell @kind hook */
import { useCallback } from 'react';
import { nav } from '@drizztdourden08/brock-react';
import { useCatalogLinks } from '@drizztdourden08/brock-catalog/renderer';
import type { CatalogLink } from '@drizztdourden08/brock-catalog/renderer';
import { useStoreLinkStore } from '@app/stores/store-link';

const useStoreLinks = (): void => {
  const offer = useStoreLinkStore((s) => s.offer);

  const handleLink = useCallback((link: CatalogLink) => {
    offer(link);
    nav.open('store');
  }, [offer]);

  useCatalogLinks(handleLink);
};

export { useStoreLinks };
