/* @layer electron-main @kind logic */
/**
 * Opening a pack file from the desktop. Windows and Linux pass the path in argv, macOS
 * delivers an `open-file` event; both dispatch on the extension. A `.msul` music pack goes to
 * the renderer, which owns that import; a `.rsp` character or a `.rlang` language set is
 * imported here through the shared installers.
 *
 * No single-instance lock (a person's session and an automated one must coexist), so a
 * file-association launch is a new process that starts with a path. No attempt is made
 * to find a running instance.
 */
import { app } from 'electron';
import type { BrowserWindow } from 'electron';
import { emit } from '../lib/ipc/handle';
import { importOpenedDocument } from '../documents/import-document';
import type { OpenedContainer } from '../documents/import-document';

type OpenedKind = 'msul' | OpenedContainer;

const EXTENSION_KINDS: Record<string, OpenedKind> = { '.msul': 'msul', '.rsp': 'rsp', '.rlang': 'rlang' };

/** The kind of pack a path names, by its extension; null for anything else. */
const openedKindOf = (value: string): OpenedKind | null => {
  const dot = value.lastIndexOf('.');
  return dot === -1 ? null : EXTENSION_KINDS[value.slice(dot).toLowerCase()] ?? null;
};

const isMsulPath = (value: string): boolean => openedKindOf(value) === 'msul';

/** Pack paths in argv, ignoring the executable and any `--flags`. */
const packPathsFromArgv = (argv: string[]): string[] =>
  argv.slice(1).filter((arg) => !arg.startsWith('-') && openedKindOf(arg) !== null);

/**
 * Handle any pack the app was opened with, plus any that arrive later (macOS can deliver
 * `open-file` at any time). Safe to call once the window exists.
 */
const registerMsulOpenHandler = (window: BrowserWindow): void => {
  const dispatch = (path: string): void => {
    const kind = openedKindOf(path);
    if (kind === 'msul') emit(window, 'msu:openPack', path);
    else if (kind) importOpenedDocument(path, kind);
  };

  // Wait for the renderer to be listening; a file association launch races window creation.
  const dispatchWhenReady = (path: string): void => {
    if (window.webContents.isLoading()) window.webContents.once('did-finish-load', () => dispatch(path));
    else dispatch(path);
  };

  for (const path of packPathsFromArgv(process.argv)) dispatchWhenReady(path);

  app.on('open-file', (event, path) => {
    event.preventDefault();
    if (openedKindOf(path)) dispatchWhenReady(path);
  });
};

export { registerMsulOpenHandler, packPathsFromArgv, isMsulPath, openedKindOf };
