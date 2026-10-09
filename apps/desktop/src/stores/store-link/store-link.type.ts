/* @layer renderer-stores @kind types */
import type { StoreOpenInstall } from '@shared/ipc';

interface StoreLinkStore {
  pending: StoreOpenInstall | null;
  offer: (link: StoreOpenInstall) => void;
  take: () => StoreOpenInstall | null;
}

export type { StoreLinkStore };
