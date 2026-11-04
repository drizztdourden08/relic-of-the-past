/* @layer bridge-wasm @kind logic */
import { alttpMsuConfig, startMsuSession as start } from '@rotp/msu';
import type { MsuSessionOptions } from '@rotp/msu';
import { log } from '../../log-bus';
import { attachHooks } from './attach-hooks';
import { msuHost } from './msu-host';
import { stopMsuSession } from './stop-msu-session';

type StartOptions = Omit<MsuSessionOptions, 'config' | 'host' | 'log'>;

const startMsuSession = (options: StartOptions): void => {
  stopMsuSession();
  const session = start({
    ...options,
    config: alttpMsuConfig,
    host: msuHost,
    log: { info: (message) => log.app(`[MSU] ${message}`), error: (message) => log.error(`[MSU] ${message}`) },
  });
  attachHooks(session);
};

export { startMsuSession };
export type { StartOptions };
