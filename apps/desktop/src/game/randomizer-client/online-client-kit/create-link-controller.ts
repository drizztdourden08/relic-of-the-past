/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import { createReconnector } from '@rotp/randomizer';
import { buildOnlineContext } from './build-online-context';
import { makeCleanup } from './make-cleanup';
import { makeCloseHandler } from './make-close-handler';
import { makeConnect } from './make-connect';
import type { ClientKit, LinkController } from './online-client-kit.type';

const createLinkController = (kit: ClientKit): LinkController => {
  const { state, network, setStatus } = kit;

  const cleanup = makeCleanup(kit, () => reconnector.cancel());

  const endSession = (): void => {
    state.stopped = true;
    reconnector.cancel();
    if (!state.link?.close()) cleanup();
  };

  const fail = (message: string, logLine = message): void => {
    log.randomizer(logLine, 'error');
    network.failed(message);
    setStatus('error');
    endSession();
  };

  const ctx = buildOnlineContext(kit, {
    fail,
    markConnected: () => {
      state.everConnected = true;
      reconnector.reset();
      setStatus('active');
    },
  });

  const handleClose = makeCloseHandler(kit, cleanup, () => reconnector.schedule());
  const connect = makeConnect(kit, ctx, handleClose);

  const reconnector = createReconnector(() => {
    network.attempting();
    connect();
  }, (delay, attempt) => {
    log.randomizer(`[Online] ${state.everConnected ? 'Connection lost' : state.closeReason}, retrying in ${delay / 1000}s`, 'warn');
    network.retrying(delay, attempt);
  });

  return { ctx, connect, endSession, reconnector };
};

export { createLinkController };
