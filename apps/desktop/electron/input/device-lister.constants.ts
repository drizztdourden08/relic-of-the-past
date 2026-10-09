/* @layer electron-main @kind constants */
import { listDevicesViaSdl } from './device-lister-sdl';
import type { DeviceLister } from './device-lister.type';

const ACTIVE_LISTERS: readonly DeviceLister[] = [listDevicesViaSdl];

export { ACTIVE_LISTERS };
