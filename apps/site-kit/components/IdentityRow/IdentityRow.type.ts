/* @layer site-kit @kind types */
import type { Provider } from '@shared/hub/providers';
import type { Identity } from '@shared/hub/types';

type IdentityRowProps = {
  provider: Provider;
  identity: Identity | null;
  canUnlink: boolean;
  busy: boolean;
  onUnlink: (provider: Provider) => void;
};

export type { IdentityRowProps };
