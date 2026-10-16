/* @layer renderer-lib @kind logic */
import { runAssetWebWorkerJob } from '@drizztdourden08/brock-port-kit/renderer';
import ExtractWorker from '@app/game/extract-assets-worker?worker';
import type { ExtractStepId } from '@app/game/extract-steps';
import { STEP_JOB_OPTIONS } from './extraction-client.constants';
import type { ExtractJob } from './extraction-client.type';

const runExtractStep = async <Id extends ExtractStepId, Result>({ step, title, subject, romBytes, input }: ExtractJob<Id>): Promise<Result> => {
  const results = await runAssetWebWorkerJob({
    id: `${step}:${subject}`,
    title,
    worker: ExtractWorker,
    workerData: { romBytes },
    steps: [{ id: step, label: title, input }],
    ...STEP_JOB_OPTIONS[step],
  });
  return results[step] as Result;
};

export { runExtractStep };
