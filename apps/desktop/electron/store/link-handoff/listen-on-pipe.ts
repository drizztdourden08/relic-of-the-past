/* @layer electron-main @kind logic */
import type { Server } from 'net';

const listenOnPipe = (server: Server, path: string): Promise<void> =>
  new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(path, () => {
      server.off('error', reject);
      resolve();
    });
  });

export { listenOnPipe };
