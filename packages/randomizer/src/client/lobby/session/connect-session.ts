/* @layer bridge-wasm @kind logic */
import { PROTOCOL_NAME, SUPPORTED_PROTOCOL_VERSIONS, formatLobbyCode } from '@drizztdourden08/archipelia-lobby-protocol';
import { closedEarly, connectionFailed, connectionLost } from '../failure';
import { openLobbyLink } from '../link/open-lobby-link';
import { emitEvent } from './emit-event';
import { failSession } from './fail-session';
import { freshWire } from './fresh-wire';
import { routeMessage } from './route-message';
import { sendHello } from './send-hello';
import type { SessionCtx } from './session-context.type';

const askInfoFirst = (ctx: SessionCtx): boolean => ctx.config.preflight === true && ctx.state.token === null;

const sendInfoRequest = (ctx: SessionCtx): void => {
  const { link, config } = ctx;
  if (link === null) return;
  ctx.wire.infoSeq = link.nextSeq();
  link.send({
    type: 'lobby.info',
    seq: ctx.wire.infoSeq,
    protocol: { name: PROTOCOL_NAME, versions: config.protocolVersions ?? [...SUPPORTED_PROTOCOL_VERSIONS] },
    lobby: { code: formatLobbyCode(config.code) ?? config.code },
  });
};

const onOpen = (ctx: SessionCtx, url: string): void => {
  emitEvent(ctx, { type: 'connected', url });
  if (askInfoFirst(ctx)) sendInfoRequest(ctx);
  else sendHello(ctx);
};

const scheduleReconnect = (ctx: SessionCtx): void => {
  ctx.attempts += 1;
  if (ctx.attempts > ctx.maxReconnects) {
    failSession(ctx, connectionLost());
    return;
  }
  ctx.reconnector.schedule();
};

const onClosed = (ctx: SessionCtx, opened: boolean): void => {
  ctx.link = null;
  ctx.uploader?.cancel();
  ctx.uploader = null;
  if (ctx.finished) return;
  for (const download of ctx.downloads.values()) download.reject(new Error('The lobby connection closed.'));
  ctx.downloads.clear();
  if (ctx.state.token === null) {
    failSession(ctx, opened ? closedEarly() : connectionFailed(ctx.config.server));
    return;
  }
  scheduleReconnect(ctx);
};

const connectSession = (ctx: SessionCtx): void => {
  if (ctx.finished) return;
  ctx.wire = freshWire();
  const link = openLobbyLink(ctx.config.server, ctx.createSocket, {
    onOpen: (url) => {
      if (ctx.link === link) onOpen(ctx, url);
    },
    onMessage: (outcome) => {
      if (ctx.link === link) routeMessage(ctx, outcome);
    },
    onClose: (opened) => {
      if (ctx.link === link) onClosed(ctx, opened);
    },
  });
  ctx.link = link;
};

export { connectSession };
