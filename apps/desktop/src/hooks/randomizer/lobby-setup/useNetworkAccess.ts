/* @layer renderer-lib @kind hook */
import { useCallback, useEffect, useState } from 'react';
import { requireHostApi } from '@drizztdourden08/brock-react';
import type { FirewallStatus } from '@app/ipc';
import type { NetworkAccess } from './useNetworkAccess.type';

const useNetworkAccess = (on: boolean): NetworkAccess => {
  const [status, setStatus] = useState<FirewallStatus>('unknown');

  const recheck = useCallback(() => {
    void requireHostApi().getFirewallStatus().then(setStatus);
  }, []);

  const allow = useCallback(() => {
    void requireHostApi().allowFirewall().then(setStatus);
  }, []);

  useEffect(() => {
    if (on) recheck();
  }, [on, recheck]);

  return { status, recheck, allow };
};

export { useNetworkAccess };
