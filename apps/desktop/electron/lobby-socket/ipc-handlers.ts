/* @layer electron-main @kind logic */
import { BrowserWindow } from 'electron';
import type { WebContents } from 'electron';
import { emit, handle } from '@drizztdourden08/brock-electron/main';
import { createLobbySockets } from './create-lobby-sockets';

const registerLobbySocketHandlers = (): void => {
  const sockets = createLobbySockets();
  const watched = new Set<number>();

  const closeWithWindow = (sender: WebContents): void => {
    if (watched.has(sender.id)) return;
    const owner = sender.id;
    watched.add(owner);
    const release = (): void => sockets.closeOwnedBy(owner);
    sender.once('destroyed', () => {
      watched.delete(owner);
      release();
    });
    sender.on('did-start-loading', release);
  };

  handle('lobby-socket:open', (event, id, url) => {
    const { sender } = event;
    closeWithWindow(sender);
    sockets.open(sender.id, id, url, (socketEvent) => {
      const win = BrowserWindow.fromWebContents(sender);
      if (win) emit(win, 'lobby-socket:event', socketEvent);
    });
    return Promise.resolve();
  });

  handle('lobby-socket:send', (_event, id, data) => {
    sockets.send(id, data);
    return Promise.resolve();
  });

  handle('lobby-socket:close', (_event, id) => {
    sockets.close(id);
    return Promise.resolve();
  });
};

export { registerLobbySocketHandlers };
