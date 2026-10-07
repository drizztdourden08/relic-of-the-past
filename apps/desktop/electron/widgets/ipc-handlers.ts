/* @layer electron-main @kind logic */
import { emit, handle, on } from '../lib/ipc/handle';
import { getMainWindow } from '../window/create-window';
import { setPin, setSnap, windowState } from './popout-registry';
import { closePopOut, listPopOuts, openPopOut, relayToPopOuts } from './popout-windows';

const registerWidgetHandlers = (): void => {
  handle('widget:popOut', (_event, id, popped) => { openPopOut(id, popped); });
  handle('widget:listPopped', () => listPopOuts());
  handle('widget:setPin', (_event, id, mode) => setPin(id, mode));
  handle('widget:getWindowState', (_event, id) => windowState(id));
  on('widget:dockBack', (_event, id, where) => closePopOut(id, where));
  on('widget:setSnap', (_event, id, value) => setSnap(id, value));
  // A popped window changed its own frame: the main window keeps and republishes it.
  on('widget:setFrame', (_event, id, patch) => {
    const main = getMainWindow();
    if (main) emit(main, 'widget:frame', id, patch);
  });
  // The main window publishes; every pop-out hears it.
  on('widget:publish', (_event, slice) => relayToPopOuts(slice));
  // A pop-out that just loaded asks the main window for everything at once.
  on('widget:subscribe', (_event, id) => {
    const main = getMainWindow();
    if (main) emit(main, 'widget:snapshotRequest', id);
  });
};

export { registerWidgetHandlers };
