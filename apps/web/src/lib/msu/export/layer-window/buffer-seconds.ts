/* @layer renderer-lib @kind logic */
const bufferSeconds = {
  total: (buffers: AudioBuffer[]): number => buffers.reduce((sum, b) => sum + b.duration, 0),
  longest: (buffers: AudioBuffer[]): number => buffers.reduce((max, b) => Math.max(max, b.duration), 0),
};

export { bufferSeconds };
