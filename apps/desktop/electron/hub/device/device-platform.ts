/* @layer electron-main @kind logic */
import type { DevicePlatform } from '@shared/hub';
import { PLATFORM_OF_NODE } from './device.constants';

const devicePlatform = (): DevicePlatform => PLATFORM_OF_NODE[process.platform] ?? 'linux';

export { devicePlatform };
