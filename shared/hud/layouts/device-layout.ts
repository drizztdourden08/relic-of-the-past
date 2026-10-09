/* @layer shared-hud @kind logic */
import { DEVICE_LAYOUTS } from './device-layout.constants';
import type { LayoutDeviceKind } from './device-layout.type';

const defaultLayoutIdFor = (device: LayoutDeviceKind): string => DEVICE_LAYOUTS[device];

export { defaultLayoutIdFor };
