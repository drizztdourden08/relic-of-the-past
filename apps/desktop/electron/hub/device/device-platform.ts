/* @layer electron-main @kind logic */
import type { DevicePlatform } from '@rotp/hub-contracts';
import { PLATFORM_OF_NODE } from './device.constants';

const devicePlatform = (): DevicePlatform => PLATFORM_OF_NODE[process.platform] ?? 'linux';

export { devicePlatform };
