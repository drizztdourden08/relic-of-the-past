/* @layer renderer-components @kind logic */
import type { ByteColorResult, ByteStatus, GyroState } from './hid-calibration.type';

const getByteColor = (idx: number, byteStatuses: ByteStatus[], gyroState: GyroState, gyroChangedBytes: Set<number>): ByteColorResult => {
  if (gyroState === 'recording' && gyroChangedBytes.has(idx)) {
    return { bg: '#3b1a1a', border: '#f87171', text: '#f87171' };
  }
  const status = byteStatuses[idx] ?? 'unknown';
  switch (status) {
    case 'excluded': return { bg: '#2a2a2a', border: '#555', text: '#6b6b6b' };
    case 'stick': return { bg: '#0f2a3d', border: '#38bdf8', text: '#38bdf8' };
    case 'trigger': return { bg: '#2d150f', border: '#fb923c', text: '#fb923c' };
    case 'button': return { bg: '#0f2e1a', border: '#4ade80', text: '#4ade80' };
    default: return { bg: '#1e1e2e', border: '#4a5568', text: '#c9d1d9' };
  }
};

export { getByteColor };
