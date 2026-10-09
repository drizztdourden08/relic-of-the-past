/* @layer site-kit @kind types */
import type { Provider, Identity } from '@rotp/hub-contracts';

type IdentityRowProps = {
  provider: Provider;
  identity: Identity | null;
  canUnlink: boolean;
  busy: boolean;
  onUnlink: (provider: Provider) => void;
};

export type { IdentityRowProps };
