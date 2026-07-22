/* @layer bridge-wasm @kind logic */
/**
 * Detailed JSONL sink for a simulator run. `append` is fire-and-forget: each
 * entry is stringified and pushed to the electron log handler, but writes are
 * serialized through a single promise chain so bursts never interleave lines.
 * `write` is the SimEvent-typed alias the runner drives.
 */
import type { SimEvent } from '@shared/game/simulation';

interface SimLogWriter {
  append: (entry: object) => void;
  write: (event: SimEvent) => void;
  openLog: () => Promise<void>;
}

const createSimLogWriter = (runId: string): SimLogWriter => {
  let chain: Promise<unknown> = Promise.resolve();

  const append = (entry: object): void => {
    const line = JSON.stringify(entry);
    chain = chain.then(() => window.api.appendSimLog({ runId, line })).catch(() => undefined);
  };

  const write = (event: SimEvent): void => append(event);

  const openLog = (): Promise<void> => window.api.openSimLog({ runId }).then(() => undefined);

  return { append, write, openLog };
};

export { createSimLogWriter };
export type { SimLogWriter };
