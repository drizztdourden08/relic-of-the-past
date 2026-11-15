/* @layer shared-asset-extraction @kind logic */
import { byteStep } from './byte-step';
import { BANK_BYTES, STEP_ERROR, STEP_FINISH, STEP_MESSAGE, STEP_SWITCH } from './stream.constants';
import type { SegmentEnd, SegmentRequest, SegmentResult, SegmentScan } from './stream.type';

const scanSegment = (scan: SegmentScan, request: SegmentRequest): SegmentResult => {
  const { bytes, layout, budget } = scan;
  const { start, before } = request;
  const bankEnd = Math.min(bytes.length, start - (start % BANK_BYTES) + BANK_BYTES);
  let p = start;
  let count = 0;
  let firstEnd = -1;
  const done = (end: SegmentEnd): SegmentResult => ({ end, count, stop: p, firstEnd });

  while (p < bankEnd) {
    budget.steps -= 1;
    if (budget.steps <= 0) return done('error');
    const step = byteStep(layout, bytes[p] ?? 0);
    if (step === STEP_MESSAGE) {
      count += 1;
      if (firstEnd < 0) firstEnd = p;
      p += 1;
      if (layout.stopAfter !== null && before + count >= layout.stopAfter) return done('finish');
    } else if (step === STEP_FINISH) return done('finish');
    else if (step === STEP_SWITCH) return done('switch');
    else if (step === STEP_ERROR) return done('error');
    else p += step;
  }
  return done('error');
};

export { scanSegment };
