/* @layer bridge-wasm @kind types */
interface RatioCheck {
  valid: boolean;
  ratio: number;
  error?: string;
}

interface RatioReadout {
  detected: number;
  used: number;
  capped: boolean;
}

interface RatioPair {
  w: number;
  h: number;
}

interface LandscapePair {
  long: number;
  short: number;
}

export type { RatioCheck, RatioReadout, RatioPair, LandscapePair };
