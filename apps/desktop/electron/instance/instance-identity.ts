/* @layer electron-main @kind logic */
import { app, nativeImage } from 'electron';
import { resolveWindowIcon } from '../window/window-icon';
import { BASE_APP_ID } from './instance-identity.constants';

const applyInstanceIdentity = (instanceName: string | null): void => {
  if (!instanceName) return;

  if (process.platform === 'win32') {
    app.setAppUserModelId(`${BASE_APP_ID}.instance.${instanceName}`);
    return;
  }

  if (process.platform === 'darwin') {
    const image = nativeImage.createFromPath(resolveWindowIcon(instanceName));
    if (!image.isEmpty()) app.dock?.setIcon(image);
  }
};

export { applyInstanceIdentity };
