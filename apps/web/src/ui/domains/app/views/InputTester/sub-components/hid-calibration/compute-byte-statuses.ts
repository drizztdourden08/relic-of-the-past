/* @layer renderer-components @kind logic */
import type { ByteStatus, InputItem } from './hid-calibration.type';

const computeByteStatuses = (len: number, excluded: Set<number>, capturedStickBytes: Set<number>, capturedTriggerBytes: Set<number>, items: InputItem[]): ByteStatus[] => {
  const statuses: ByteStatus[] = new Array(len).fill('unknown');
  for (const i of excluded) {
    if (i < len) statuses[i] = 'excluded';
  }
  for (const i of capturedStickBytes) {
    if (i < len) statuses[i] = 'stick';
  }
  for (const i of capturedTriggerBytes) {
    if (i < len) statuses[i] = 'trigger';
  }
  for (const item of items) {
    if (item.mapping && item.status === 'captured') {
      const bi = item.mapping.byteIndex;
      if (bi < len) statuses[bi] = 'button';
    }
  }
  return statuses;
};

export { computeByteStatuses };
