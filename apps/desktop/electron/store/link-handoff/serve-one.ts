/* @layer electron-main @kind logic */
import type { Socket } from 'net';
import type { InstallLink } from '@shared/store/deep-link';
import { ACK, NACK, isMessagePending, parseHandoffMessage } from '../handoff-message';
import { HANDOFF_TIMEOUT_MS } from './link-handoff.constants';

const serveOne = (socket: Socket, onLink: (link: InstallLink) => void): void => {
  let received = '';
  socket.setEncoding('utf8');
  socket.setTimeout(HANDOFF_TIMEOUT_MS, () => socket.destroy());
  socket.on('error', () => socket.destroy());
  socket.on('data', (chunk: string) => {
    received += chunk;
    if (isMessagePending(received)) return;
    const link = parseHandoffMessage(received);
    socket.end(link ? ACK : NACK);
    if (link) onLink(link);
  });
};

export { serveOne };
