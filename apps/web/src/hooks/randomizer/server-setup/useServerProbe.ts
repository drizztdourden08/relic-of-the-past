/* @layer renderer-lib @kind hook */
/**
 * The server setup's Test connection: the boot's own pre-flight probe (online-probe.ts), run
 * on demand against the address in the fields. It only asks the room for its greeting, so it
 * says whether the server answers and hosts this game; the slot and password are checked
 * when the game connects. A result belongs to the address it tested: edit the address and
 * the result goes.
 */
import { useCallback, useRef, useState } from 'react';
import { normalizeServerUrl, probeOnlineServer, PROBE_TIMEOUT_MS } from '@app/lib/game/randomizer-client/online-probe';
import { serverAddressError } from '@app/lib/game/randomizer-client/server-address';
import { serverUrlOf } from './server-setup-draft';
import type { ProbeResult } from '@app/lib/game/randomizer-client/online-probe';
import type { ServerSetupDraft } from './server-setup-draft';

type ServerProbeState =
  | { kind: 'idle' }
  | { kind: 'testing' }
  | { kind: 'ok'; text: string }
  | { kind: 'failed'; text: string };

interface ServerProbe {
  state: ServerProbeState;
  test: () => Promise<void>;
}

const IDLE: ServerProbeState = { kind: 'idle' };

/** The probe's reasons, in the words a player reads. */
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
    // A later test, or an edit that started one, owns the result now.
    if (run === runRef.current) setProbe({ url, state: stateOf(result) });
  }, [draft, url]);

  return { state: probe !== null && probe.url === url ? probe.state : IDLE, test };
};

export { useServerProbe };
export type { ServerProbe, ServerProbeState };
