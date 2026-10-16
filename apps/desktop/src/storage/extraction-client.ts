/* @layer renderer-lib @kind logic */
import { runAssetWebWorkerJob } from '@drizztdourden08/brock-port-kit/renderer';
import ExtractWorker from '@app/game/extract-assets-worker?worker';
import type { ExtractStepId } from '@app/game/extract-steps';
import type { ExtractJob } from './extraction-client.type';

let jobCount = 0;

const jobIdOf = (step: string, subject: string): string => `${step}:${subject}#${++jobCount}`;

const runExtractStep = async <Id extends ExtractStepId, Result>({ step, title, subject, romBytes, input }: ExtractJob<Id>): Promise<Result> => {
  const results = await runAssetWebWorkerJob({
    id: jobIdOf(step, subject),
    title,
    worker: ExtractWorker,
    workerData: { romBytes },
    steps: [{ id: step, label: title, input }],
  });
  return results[step] as Result;
};

export { runExtractStep };
