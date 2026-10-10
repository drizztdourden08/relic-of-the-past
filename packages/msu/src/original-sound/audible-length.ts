/* @layer bridge-wasm @kind logic */
import { SILENCE_FLOOR } from './original-sound.constants';

const audibleLength = (samples: Int16Array): number => {
  for (let i = samples.length - 2; i >= 0; i -= 2) {
    if (Math.abs(samples[i] ?? 0) > SILENCE_FLOOR || Math.abs(samples[i + 1] ?? 0) > SILENCE_FLOOR) {
      return (i >> 1) + 1;
    }
  }
  return 0;
};

export { audibleLength };
