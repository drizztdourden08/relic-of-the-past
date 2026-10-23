/* @layer renderer-lib @kind logic */
import type { VidPid } from './pad-overlay.type';

const hex4 = (value: number): string => value.toString(16).padStart(4, '0');

const vidPidKey = (vendorId: number, productId: number): VidPid => `${hex4(vendorId)}:${hex4(productId)}`;

export { vidPidKey };
