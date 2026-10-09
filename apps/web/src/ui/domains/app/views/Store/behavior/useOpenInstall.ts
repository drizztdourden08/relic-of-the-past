/* @layer renderer-components @kind hook */
import { useEffect } from 'react';
import { useStoreLinkStore } from '@app/stores/store-link';
import type { OpenInstallParams } from '../Store.type';

const useOpenInstall = (params: OpenInstallParams) => {
  const { signedIn, onOpen, install } = params;
  const pending = useStoreLinkStore((s) => s.pending);
  const take = useStoreLinkStore((s) => s.take);

  useEffect(() => {
    if (!pending) return;
    onOpen(pending.itemId);
    if (!signedIn) return;
    const link = take();
    if (link) install(link.itemId, link.version);
  }, [pending, signedIn, onOpen, install, take]);

  return { waitingLink: signedIn ? null : pending };
};

export { useOpenInstall };
