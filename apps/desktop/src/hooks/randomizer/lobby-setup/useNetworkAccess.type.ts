/* @layer renderer-lib @kind types */
import type { FirewallStatus } from '@app/ipc';

interface NetworkAccess {
  status: FirewallStatus;
  recheck: () => void;
  allow: () => void;
}

export type { NetworkAccess };
