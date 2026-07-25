/* @layer electron-main @kind logic */
/**
 * Makes the OS itself present a named instance as its own app, so an automated
 * launch is recognisable wherever windows are listed — not only inside our titlebar.
 *
 * Each platform needs a different call, and `BrowserWindow.icon` alone covers none of
 * them fully:
 *   Windows  the taskbar button takes the window icon, but grouping and pinning key off
 *            the AppUserModelID. Without a distinct one, instances collapse into the
 *            same taskbar group as the user's own app.
 *   macOS    BrowserWindow.icon is IGNORED. The dock icon is process-wide and must be
 *            set through app.dock.
 *   Linux    the window icon is what desktop environments show; nothing extra to do.
 *
 * A normal launch is untouched — no instance, no identity override.
 */
import { app, nativeImage } from 'electron';
import { resolveWindowIcon } from '../window/window-icon';

const BASE_APP_ID = 'com.drizztdourden.relic-of-the-past';

/**
 * Called before the first window is created: setAppUserModelId must be in place
 * before Windows associates a window with a taskbar button.
 */
const applyInstanceIdentity = (instanceName: string | null): void => {
  if (!instanceName) return;

  if (process.platform === 'win32') {
    // A per-instance id gives each one its own taskbar group and its own icon there,
    // instead of inheriting the group of whatever launched it.
    app.setAppUserModelId(`${BASE_APP_ID}.instance.${instanceName}`);
    return;
  }

  if (process.platform === 'darwin') {
    const image = nativeImage.createFromPath(resolveWindowIcon(instanceName));
    if (!image.isEmpty()) app.dock?.setIcon(image);
  }
};

export { applyInstanceIdentity };
