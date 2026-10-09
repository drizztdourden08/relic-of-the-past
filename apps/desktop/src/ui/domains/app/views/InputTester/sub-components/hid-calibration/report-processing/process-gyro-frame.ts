/* @layer renderer-components @kind logic */
import { trackExtremes } from './track-extremes';
import { GYRO_BUFFER_FRAMES, PROCESS_EVERY_FRAMES } from './report-processing.constants';
import type { GyroRefs } from './report-processing.type';

const processGyroFrame = (bytes: Uint8Array, refs: GyroRefs, onChangedUpdate: (changed: Set<number>) => void): void => {
  const len = bytes.length;
  const mins = refs.gyroMinsRef.current;
  const maxs = refs.gyroMaxsRef.current;
  trackExtremes(bytes, mins, maxs);
  refs.gyroBufferRef.current.push(new Uint8Array(bytes));
  if (refs.gyroBufferRef.current.length > GYRO_BUFFER_FRAMES) refs.gyroBufferRef.current.shift();

  if (refs.gyroBufferRef.current.length % PROCESS_EVERY_FRAMES === 0) {
    const changed = new Set<number>();
    for (let i = 0; i < len; i++) {
      if (maxs[i] !== mins[i]) changed.add(i);
    }
    onChangedUpdate(changed);
  }
};

export { processGyroFrame };
