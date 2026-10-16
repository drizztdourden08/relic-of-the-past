/* @layer renderer-lib @kind logic */
import { jobs } from '@drizztdourden08/brock-react';
import { runAssetWebWorkerJob } from '@drizztdourden08/brock-port-kit/renderer';
import type { StartJob } from '@drizztdourden08/brock-core/jobs';
import type { JobOptions } from '@drizztdourden08/brock-core/types';
import ExtractWorker from '@app/game/extract-assets-worker?worker';
import type { ExtractStepId } from '@app/game/extract-steps';
import { STEP_JOB_OPTIONS } from './extraction-client.constants';
import type { ExtractJob } from './extraction-client.type';

const startWith = (options: JobOptions): StartJob => (id, steps, base) => jobs.start(id, steps, { ...base, ...options });

const runExtractStep = async <Id extends ExtractStepId, Result>({ step, title, subject, romBytes, input }: ExtractJob<Id>): Promise<Result> => {
  const results = await runAssetWebWorkerJob({
    id: `${step}:${subject}`,
    title,
    worker: ExtractWorker,
    workerData: { romBytes },
    steps: [{ id: step, label: title, input }],
    start: startWith(STEP_JOB_OPTIONS[step]),
  });
  return results[step] as Result;
};

export { runExtractStep };
