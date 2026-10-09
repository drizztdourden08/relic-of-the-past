/* @layer bridge-wasm @kind types */
import type { ApGameData } from '../ap-protocol.type';

interface CacheSplit {
  cached: Record<string, ApGameData>;
  missing: string[];
}

export type { CacheSplit };
