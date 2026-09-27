/* @layer electron-main @kind logic */
/**
 * Bringing a rotp:// link to the running app, without a single-instance lock. The player's
 * app listens on a pipe named after its user data folder (a named pipe on Windows, a socket
 * in that folder elsewhere). A process the browser started with a link tries the pipe first:
 * when an app answers, it hands the link over and quits; when none does, it starts normally
 * and installs the link itself. Automation launches never listen and never hand off, so a
 * test window and the player's window never trade links.
 */
import { createHash } from 'crypto';
import { rm } from 'fs/promises';
import { connect, createServer } from 'net';
import type { Server, Socket } from 'net';
import { join } from 'path';
import { app } from 'electron';
import { installLinkFromArgv } from '@shared/store/deep-link';
import type { InstallLink } from '@shared/store/deep-link';
import { isAutomationLaunch } from '../instance';
import { ACK, NACK, formatHandoffMessage, isMessagePending, parseHandoffMessage } from './handoff-message';

const HANDOFF_TIMEOUT_MS = 1500;

/** One pipe per user data folder, so a portable copy and an installed one keep their own. */
const pipePath = (): string => {
  const userData = app.getPath('userData');
  if (process.platform !== 'win32') return join(userData, 'store-link.sock');
  const key = createHash('sha256').update(userData.toLowerCase()).digest('hex').slice(0, 16);
  return `\\\\.\\pipe\\rotp-store-${key}`;
};

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

const listen = (server: Server, path: string): Promise<void> =>
  new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(path, () => {
      server.off('error', reject);
      resolve();
    });
  });

/** Sends the link; true once a listening app accepted it. */
const handOff = (link: InstallLink): Promise<boolean> =>
  new Promise((resolve) => {
    let answer = '';
    const socket = connect(pipePath());
    const finish = (accepted: boolean) => {
      clearTimeout(timer);
      socket.destroy();
      resolve(accepted);
    };
    const timer = setTimeout(() => finish(false), HANDOFF_TIMEOUT_MS);
    socket.setEncoding('utf8');
    socket.on('connect', () => socket.write(formatHandoffMessage(link)));
    socket.on('data', (chunk: string) => {
      answer += chunk;
      if (answer.includes('\n') || answer.length > ACK.length) finish(answer === ACK);
    });
    socket.on('error', () => finish(false));
    socket.on('end', () => finish(answer === ACK));
  });

/** A socket file left by an app that exited: nothing answers on it. Windows pipes never linger. */
const isStaleSocket = async (path: string): Promise<boolean> =>
  process.platform !== 'win32' && !(await new Promise<boolean>((resolve) => {
    const probe = connect(path, () => { probe.destroy(); resolve(true); });
    probe.on('error', () => resolve(false));
  }));

/** The player's app listens; another copy already listening keeps the links. */
const listenForLinks = async (onLink: (link: InstallLink) => void): Promise<void> => {
  if (isAutomationLaunch()) return;
  const path = pipePath();
  const server = createServer((socket) => serveOne(socket, onLink));
  try {
    await listen(server, path);
  } catch {
    if (!(await isStaleSocket(path))) return;
    await rm(path, { force: true });
    await listen(server, path).catch(() => undefined);
  }
};

/** For a process started with a link: true when a running app took it, so this one can quit. */
const handOffLaunchLink = async (): Promise<boolean> => {
  if (isAutomationLaunch()) return false;
  const link = installLinkFromArgv(process.argv);
  return link ? handOff(link) : false;
};

export { listenForLinks, handOffLaunchLink, handOff, pipePath };
