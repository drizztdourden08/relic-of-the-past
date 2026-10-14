/* @layer renderer-components @kind logic */
import type { StickSide } from '../hid-calibration.type';
import type { StickFinalizeRefs } from './stick-trigger-handlers.type';

const claimStickBytes = (side: StickSide, byteIndices: readonly number[], refs: StickFinalizeRefs): number[] => {
  const sideBytes = side === 'left' ? refs.leftStickBytesRef : refs.rightStickBytesRef;
  sideBytes.current = new Set();
  const claimed: number[] = [];
  for (const bi of new Set(byteIndices)) {
    refs.excludedRef.current.add(bi);
    refs.capturedStickBytesRef.current.add(bi);
    sideBytes.current.add(bi);
    claimed.push(bi);
  }
  return claimed;
};

export { claimStickBytes };
