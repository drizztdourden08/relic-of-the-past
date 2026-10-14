/* @layer renderer-components @kind logic */
import type { ByteStatus } from './hid-calibration.type';
import type { ComputeByteStatusesArgs } from './compute-byte-statuses.type';

const markBytes = (statuses: ByteStatus[], indices: Iterable<number>, status: ByteStatus): void => {
  for (const i of indices) {
    if (i < statuses.length) statuses[i] = status;
  }
};

const computeByteStatuses = (args: ComputeByteStatusesArgs): ByteStatus[] => {
  const { len, excluded, capturedStickBytes, capturedTriggerBytes, items } = args;
  const statuses = Array.from({ length: len }, (): ByteStatus => 'unknown');
  markBytes(statuses, excluded, 'excluded');
  markBytes(statuses, capturedStickBytes, 'stick');
  markBytes(statuses, capturedTriggerBytes, 'trigger');
  const buttonBytes = items.flatMap((item) => (item.mapping && item.status === 'captured' ? [item.mapping.byteIndex] : []));
  markBytes(statuses, buttonBytes, 'button');
  return statuses;
};

export { computeByteStatuses };
