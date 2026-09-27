/* @layer renderer-components @kind hook */
/**
 * A rotp://install link the browser opened. The browser's own prompt was the approval, so the
 * tab selects the item and starts the install with no further click. Signed out, the item is
 * selected and the link waits; the install starts once the sign-in completes.
 */
import { useEffect } from 'react';
import { useStoreLinkStore } from '@app/stores/store-link';

type OpenInstallParams = {
  signedIn: boolean;
  onOpen: (itemId: string) => void;
  install: (itemId: string, version: number | null) => void;
};

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
