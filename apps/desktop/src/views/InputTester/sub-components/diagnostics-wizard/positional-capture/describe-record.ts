/* @layer renderer-components @kind logic */
import type { PositionalCaptureRecord } from './positional-capture.type';

const describeRecord = (record: PositionalCaptureRecord): string => {
  if (record.status === 'skipped') return 'skipped';
  const name = record.firedPositionalName ?? `index ${record.firedIndex}`;
  return record.mismatch ? `${name} (mismatch)` : name;
};

export { describeRecord };
