/* @layer renderer-components @kind logic */
import { BYTE_COLOR_KEY_BY_STATUS } from './hid-calibration.constants';
import type { ByteColorKey, ByteStatus, GyroState } from './hid-calibration.type';

const getByteColorKey = (idx: number, byteStatuses: ByteStatus[], gyroState: GyroState, gyroChangedBytes: Set<number>): ByteColorKey => {
  if (gyroState === 'recording' && gyroChangedBytes.has(idx)) return 'gyro';
  return BYTE_COLOR_KEY_BY_STATUS[byteStatuses[idx] ?? 'unknown'];
};

export { getByteColorKey };
