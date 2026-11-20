/* @layer renderer-lib @kind logic */
import { jobs } from '@drizztdourden08/brock-react';
import { runAssetWebWorkerJob } from '@drizztdourden08/brock-port-kit/renderer';
import ExtractWorker from '@app/game/extract-assets-worker?worker';
import type { ExtractStepId } from '@app/game/extract-steps';
import { STEP_JOB_OPTIONS } from './extraction-client.constants';
import type { ExtractJob } from './extraction-client.type';

const runExtractStep = async <Id extends ExtractStepId, Result>({ step, title, subject, romBytes, input }: ExtractJob<Id>): Promise<Result> => {
  const results = await runAssetWebWorkerJob({
    id: `${step}:${subject}`,
    worker: ExtractWorker,
    workerData: { romBytes },
    steps: [{ id: step, label: title, input }],
    start: (id, steps, options) => jobs.start(id, steps, { ...options, title }),
    ...STEP_JOB_OPTIONS[step],
  });
  return results[step] as Result;
};

export { runExtractStep };
