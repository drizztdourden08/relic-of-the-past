/* @layer electron-main @kind logic */
/**
 * Opening a `.msul` music pack from the desktop. Windows and Linux pass the path in
 * argv, macOS delivers an `open-file` event; both funnel into one notification to the
 * renderer, which owns the import.
 *
 * No single-instance lock (a person's session and an automated one must coexist), so a
 * file-association launch is a new process that starts with a path. No attempt is made
 * to find a running instance.
 */
import { app } from 'electron';
import type { BrowserWindow } from 'electron';
import { emit } from '../lib/ipc/handle';

const MSUL_EXT = '.msul';

const isMsulPath = (value: string): boolean => value.toLowerCase().endsWith(MSUL_EXT);

/** Pack paths in argv, ignoring the executable and any `--flags`. */
const msulPathsFromArgv = (argv: string[]): string[] =>
  argv.slice(1).filter((arg) => !arg.startsWith('-') && isMsulPath(arg));

/**
 * Forward any pack the app was opened with, plus any that arrive later (macOS can deliver
 * `open-file` at any time). Safe to call once the window exists.
 */
const registerMsulOpenHandler = (window: BrowserWindow): void => {
  const send = (path: string): void => { emit(window, 'msu:openPack', path); };

  // Wait for the renderer to be listening; a file association launch races window creation.
  const sendWhenReady = (path: string): void => {
    if (window.webContents.isLoading()) window.webContents.once('did-finish-load', () => send(path));
    else send(path);
  };

  for (const path of msulPathsFromArgv(process.argv)) sendWhenReady(path);

  app.on('open-file', (event, path) => {
    event.preventDefault();
    if (isMsulPath(path)) sendWhenReady(path);
  });
};

export { registerMsulOpenHandler, msulPathsFromArgv, isMsulPath };
