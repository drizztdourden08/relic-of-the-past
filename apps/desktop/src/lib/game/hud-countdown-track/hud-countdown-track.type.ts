/* @layer bridge-wasm @kind types */
interface CountdownReading {
  seconds: number;
  frames: number;
  isRunning: boolean;
  isIndoors: boolean;
}

interface CountdownTrack {
  running: boolean;
  total: number;
  totalFrames: number;
  remaining: number;
  fractionLeft: number;
}

export type { CountdownReading, CountdownTrack };
