/* @layer electron-main @kind logic */
import { splashState } from './splash-state';

const setSplashStatus = (message: string): void => {
  const splash = splashState.window;
  if (!splash || splash.isDestroyed()) return;
  const call = `window.__splashStatus?.(${JSON.stringify(message)})`;
  void splash.webContents.executeJavaScript(call).catch(() => undefined);
};

export { setSplashStatus };
