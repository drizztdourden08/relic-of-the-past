/* @layer electron-main @kind logic */
import { rm } from 'fs/promises';
import { createServer } from 'net';
import type { InstallLink } from '@shared/store/deep-link';
import { isAutomationLaunch } from '../../instance';
import { isStaleSocket } from './is-stale-socket';
import { listenOnPipe } from './listen-on-pipe';
import { pipePath } from './pipe-path';
import { serveOne } from './serve-one';

const listenForLinks = async (onLink: (link: InstallLink) => void): Promise<void> => {
  if (isAutomationLaunch()) return;
  const path = pipePath();
  const server = createServer((socket) => serveOne(socket, onLink));
  try {
    await listenOnPipe(server, path);
  } catch {
    if (!(await isStaleSocket(path))) return;
    await rm(path, { force: true });
    await listenOnPipe(server, path).catch(() => undefined);
  }
};

export { listenForLinks };
