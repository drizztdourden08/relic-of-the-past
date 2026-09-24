/* @layer electron-main @kind logic */
import { emit, handle, on } from '../lib/ipc/handle';
import { getMainWindow } from '../window/create-window';
import { closePopOut, listPopOuts, openPopOut, relayToPopOuts } from './popout-windows';

const registerWidgetHandlers = (): void => {
  handle('widget:popOut', (_event, id, bounds) => { openPopOut(id, bounds); });
  handle('widget:listPopped', () => listPopOuts());
  on('widget:dockBack', (_event, id) => closePopOut(id));
  // The main window publishes; every pop-out hears it.
  on('widget:publish', (_event, slice) => relayToPopOuts(slice));
  // A pop-out that just loaded asks the main window for everything at once.
  on('widget:subscribe', (_event, id) => {
    const main = getMainWindow();
    if (main) emit(main, 'widget:snapshotRequest', id);
  });
};

export { registerWidgetHandlers };
