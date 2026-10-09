/* @layer bridge-wasm @kind types */
import type { SimEvent } from '@shared/game/simulation';

interface SimLogWriter {
  append: (entry: object) => void;
  write: (event: SimEvent) => void;
  openLog: () => Promise<void>;
}

export type { SimLogWriter };
