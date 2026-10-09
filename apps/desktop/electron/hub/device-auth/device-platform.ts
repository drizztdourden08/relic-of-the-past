/* @layer electron-main @kind logic */
import type { DevicePlatform } from '@shared/hub';

const devicePlatform = (): DevicePlatform =>
  process.platform === 'win32' ? 'windows' : process.platform === 'darwin' ? 'mac' : 'linux';

export { devicePlatform };
