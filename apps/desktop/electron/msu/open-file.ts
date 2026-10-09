/* @layer electron-main @kind logic */
import { app } from 'electron';
import type { BrowserWindow } from 'electron';
import { emit } from '@drizztdourden08/brock-electron/main';
import { importOpenedDocument } from '../documents/import-document';
import { EXTENSION_KINDS } from './open-file.constants';
import type { OpenedKind } from './open-file.type';

const openedKindOf = (value: string): OpenedKind | null => {
  const dot = value.lastIndexOf('.');
  return dot === -1 ? null : EXTENSION_KINDS[value.slice(dot).toLowerCase()] ?? null;
};

const packPathsFromArgv = (argv: string[]): string[] =>
  argv.slice(1).filter((arg) => !arg.startsWith('-') && openedKindOf(arg) !== null);

const registerMsulOpenHandler = (window: BrowserWindow): void => {
  const dispatch = (path: string): void => {
    const kind = openedKindOf(path);
    if (kind === 'msul') emit(window, 'msu:openPack', path);
    else if (kind) importOpenedDocument(path, kind);
  };

  const dispatchWhenRendererListens = (path: string): void => {
    if (window.webContents.isLoading()) window.webContents.once('did-finish-load', () => dispatch(path));
    else dispatch(path);
  };

  for (const path of packPathsFromArgv(process.argv)) dispatchWhenRendererListens(path);

  app.on('open-file', (event, path) => {
    event.preventDefault();
    if (openedKindOf(path)) dispatchWhenRendererListens(path);
  });
};

export { registerMsulOpenHandler };
