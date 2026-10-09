/* @layer bridge-wasm @kind logic */
import { appApi } from '@app/ipc/app-api';
import type { SimEvent, SimLogWriter } from '@rotp/navigation';

const createSimLogWriter = (runId: string): SimLogWriter => {
  let chain: Promise<unknown> = Promise.resolve();

  const append = (entry: object): void => {
    const line = JSON.stringify(entry);
    chain = chain.then(() => appApi().appendSimLog({ runId, line })).catch(() => undefined);
  };

  const write = (event: SimEvent): void => append(event);

  const openLog = (): Promise<void> => appApi().openSimLog({ runId }).then(() => undefined);

  return { append, write, openLog };
};

export { createSimLogWriter };
export type { SimLogWriter } from '@rotp/navigation';
