/* @layer electron-main @kind logic */
import { createSocket } from 'node:dgram';
import type { LanSighting } from '@rotp/randomizer';
import { MAX_DATAGRAM_BYTES } from './listen-beacons.constants';

const listenBeacons = (port: number, report: (sighting: LanSighting) => void): (() => void) => {
  const socket = createSocket({ type: 'udp4', reuseAddr: true });
  socket.on('message', (data, remote) => {
    if (data.length > MAX_DATAGRAM_BYTES) return;
    report({ kind: 'beacon', address: remote.address, data: data.toString('base64') });
  });
  socket.on('error', () => {
    socket.close();
  });
  socket.bind(port);
  return () => {
    try {
      socket.close();
    } catch {
      return undefined;
    }
  };
};

export { listenBeacons };
