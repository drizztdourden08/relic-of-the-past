/* @layer bridge-wasm @kind logic */
import type { SimEvent } from '@shared/game/simulation';
import type { SimLogWriter } from './sim-log-writer.type';

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
export type { SimLogWriter } from './sim-log-writer.type';
