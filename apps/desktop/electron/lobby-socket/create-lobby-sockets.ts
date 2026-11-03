/* @layer electron-main @kind logic */
import { createSocketTransport } from '@drizztdourden08/archipelia-lobby-protocol/node';
import type { TransportEvent } from '@drizztdourden08/archipelia-lobby-protocol/node';
import { ABNORMAL_CLOSE_CODE } from './lobby-socket.constants';
import type { LobbySocketEntry, LobbySockets } from './lobby-socket.type';
import { openUpgrade } from './open-upgrade';

const createLobbySockets = (): LobbySockets => {
  const live = new Map<string, LobbySocketEntry>();

  const open: LobbySockets['open'] = (owner, id, url, push) => {
    const entry: LobbySocketEntry = { owner, closing: false, transport: null };
    live.set(id, entry);

    const onTransport = (event: TransportEvent): void => {
      if (event.kind === 'text') push({ id, kind: 'message', text: event.text });
      else if (event.kind === 'close') {
        live.delete(id);
        push({ id, kind: 'close', code: event.code });
      }
    };

    openUpgrade(url).then((socket) => {
      if (entry.closing) {
        socket.destroy();
        return;
      }
      entry.transport = createSocketTransport(socket, { client: true });
      entry.transport.listen(onTransport);
      push({ id, kind: 'open' });
    }).catch(() => {
      live.delete(id);
      if (entry.closing) return;
      push({ id, kind: 'error' });
      push({ id, kind: 'close', code: ABNORMAL_CLOSE_CODE });
    });
  };

  const send: LobbySockets['send'] = (id, data) => {
    live.get(id)?.transport?.send(data);
  };

  const close: LobbySockets['close'] = (id) => {
    const entry = live.get(id);
    if (entry === undefined) return;
    entry.closing = true;
    if (entry.transport === null) live.delete(id);
    else entry.transport.close();
  };

  const closeOwnedBy: LobbySockets['closeOwnedBy'] = (owner) => {
    for (const [id, entry] of live) if (entry.owner === owner) close(id);
  };

  return { open, send, close, closeOwnedBy };
};

export { createLobbySockets };
