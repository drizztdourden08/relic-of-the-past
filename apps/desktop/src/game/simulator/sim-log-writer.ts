/* @layer bridge-wasm @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import type { SimEvent, SimLogWriter } from '@rotp/navigation';

const createSimLogWriter = (runId: string): SimLogWriter => {
  let chain: Promise<unknown> = Promise.resolve();

  const append = (entry: object): void => {
    const line = JSON.stringify(entry);
    chain = chain.then(() => requireHostApi().appendSimLog({ runId, line })).catch(() => undefined);
  };

  const write = (event: SimEvent): void => append(event);

  const openLog = (): Promise<void> => requireHostApi().openSimLog({ runId }).then(() => undefined);

  return { append, write, openLog };
};

export { createSimLogWriter };
export type { SimLogWriter } from '@rotp/navigation';
