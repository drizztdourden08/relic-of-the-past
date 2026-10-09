/* @layer renderer-components @kind logic */
import { padHex } from './pad-hex';
import type { DetectedDevice } from '@rotp/input-mapping';

const findLiveDevice = (vid: string, pid: string, devices: readonly DetectedDevice[]): DetectedDevice | undefined =>
  devices.find(d =>
    d.type === 'gamepad' && d.connected &&
    d.vendorId && d.productId &&
    padHex(d.vendorId) === vid && padHex(d.productId) === pid
  );

export { findLiveDevice };
