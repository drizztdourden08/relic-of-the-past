/* @layer bridge-wasm @kind logic */
import { serverUrlCandidates } from '../server-url';
import { probeOnce } from './probe-once';
import type { ProbeConfig, ProbeResult } from './online-probe.type';

const probeOnlineServer = async (config: ProbeConfig): Promise<ProbeResult> => {
  const candidates = serverUrlCandidates(config.url);
  if (candidates.length === 0) return { ok: false, reason: 'no server URL' };
  let last: ProbeResult = { ok: false, reason: 'no server URL' };
  for (const url of candidates) {
    const { result, opened } = await probeOnce(url, config);
    if (result.ok || opened) return result;
    last = result;
  }
  return last;
};

export { probeOnlineServer };
