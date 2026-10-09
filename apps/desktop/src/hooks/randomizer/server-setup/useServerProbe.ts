/* @layer renderer-lib @kind hook */
import { useCallback, useRef, useState } from 'react';
import { normalizeServerUrl, probeOnlineServer, PROBE_TIMEOUT_MS } from '@rotp/randomizer';
import { serverAddressError } from '@rotp/randomizer';
import { serverUrlOf } from './server-setup-draft';
import type { ProbeResult } from '@rotp/randomizer';
import type { ServerSetupDraft } from './server-setup-draft';
import type { ServerProbe, ServerProbeState } from './use-server-probe.type';
import { IDLE } from './use-server-probe.constants';

const plainReason = (reason: string): string => {
  if (reason.startsWith('no room info within')) return `no answer within ${PROBE_TIMEOUT_MS / 1000} seconds`;
  if (reason.startsWith('socket error')) return 'nothing answered at that address';
  if (reason.startsWith('connection closed')) return 'the server closed the connection';
  if (reason === 'no server URL') return 'enter a host';
  return reason;
};

const stateOf = (result: ProbeResult): ServerProbeState => (result.ok
  ? { kind: 'ok', text: result.version === undefined ? 'Reached the room.' : `Reached the room, server ${result.version}.` }
  : { kind: 'failed', text: `Not reached: ${plainReason(result.reason)}.` });

const useServerProbe = (draft: ServerSetupDraft): ServerProbe => {
  const url = serverUrlOf(draft);
  const [probe, setProbe] = useState<{ url: string; state: ServerProbeState } | null>(null);
  const runRef = useRef(0);

  const test = useCallback(async () => {
    const run = ++runRef.current;
    const problem = serverAddressError(draft);
    if (problem !== null) {
      setProbe({ url, state: { kind: 'failed', text: problem } });
      return;
    }
    setProbe({ url, state: { kind: 'testing' } });
    const result = await probeOnlineServer({ url: normalizeServerUrl(url) });
    const isLatestRun = run === runRef.current;
    if (isLatestRun) setProbe({ url, state: stateOf(result) });
  }, [draft, url]);

  return { state: probe !== null && probe.url === url ? probe.state : IDLE, test };
};

export { useServerProbe };
export type { ServerProbe, ServerProbeState };
