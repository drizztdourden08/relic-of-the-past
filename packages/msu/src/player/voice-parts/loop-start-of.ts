/* @layer renderer-lib @kind logic */
import type { DecodedAudio } from '../decode/decode-audio-file';

const loopStartOf = (decoded: DecodedAudio, override: number | undefined): number => {
  const { buffer, loopSample } = decoded;
  return Math.min(override ?? (loopSample > 0 ? loopSample / buffer.sampleRate : 0), buffer.duration);
};

export { loopStartOf };
