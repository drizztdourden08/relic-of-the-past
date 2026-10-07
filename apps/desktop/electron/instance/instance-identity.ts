/* @layer electron-main @kind logic */
/**
 * Makes the OS present a named instance as its own app wherever windows are listed.
 * `BrowserWindow.icon` alone is not enough:
 *   Windows  grouping and pinning key off the AppUserModelID; without a distinct one,
 *            instances collapse into the user's own taskbar group.
 *   macOS    BrowserWindow.icon is IGNORED; the dock icon is set through app.dock.
 *   Linux    the window icon is what desktop environments show; nothing extra.
 * A normal launch is untouched.
 */
import { app, nativeImage } from 'electron';
import { resolveWindowIcon } from '../window/window-icon';

const BASE_APP_ID = 'com.drizztdourden.relic-of-the-past';

/** Before the first window: setAppUserModelId must precede the taskbar button. */
const applyInstanceIdentity = (instanceName: string | null): void => {
  if (!instanceName) return;

  if (process.platform === 'win32') {
    // A per-instance id gives each one its own taskbar group and icon.
    app.setAppUserModelId(`${BASE_APP_ID}.instance.${instanceName}`);
    return;
  }

  if (process.platform === 'darwin') {
    const image = nativeImage.createFromPath(resolveWindowIcon(instanceName));
    if (!image.isEmpty()) app.dock?.setIcon(image);
  }
};

export { applyInstanceIdentity };
