/* @layer electron-main @kind logic */
import { randomBytes } from 'node:crypto';
import http from 'node:http';
import https from 'node:https';
import type { Duplex } from 'node:stream';
import { upgradeResponse } from '@drizztdourden08/archipelia-lobby-protocol/node';
import { OPEN_TIMEOUT_MS } from './lobby-socket.constants';

const openUpgrade = (url: string): Promise<Duplex> => new Promise((resolve, reject) => {
  const target = new URL(url.replace(/^ws/i, 'http'));
  const key = randomBytes(16).toString('base64');
  const transport = target.protocol === 'https:' ? https : http;
  const request = transport.request(target, {
    headers: { Connection: 'Upgrade', Upgrade: 'websocket', 'Sec-WebSocket-Key': key, 'Sec-WebSocket-Version': '13' },
  });
  const timer = setTimeout(() => request.destroy(new Error('lobby socket handshake timed out')), OPEN_TIMEOUT_MS);

  request.on('upgrade', (response, socket, head) => {
    clearTimeout(timer);
    const accept = response.headers['sec-websocket-accept'];
    if (typeof accept !== 'string' || !upgradeResponse(key).includes(`Sec-WebSocket-Accept: ${accept}\r\n`)) {
      socket.destroy();
      reject(new Error('lobby socket handshake rejected'));
      return;
    }
    if (head.length > 0) socket.unshift(head);
    resolve(socket);
  });
  request.on('response', (response) => {
    clearTimeout(timer);
    response.resume();
    reject(new Error(`lobby socket upgrade refused with ${String(response.statusCode)}`));
  });
  request.on('error', (error) => {
    clearTimeout(timer);
    reject(error);
  });
  request.end();
});

export { openUpgrade };
