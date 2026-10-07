/* @layer site-kit @kind logic */
/**
 * The site's action on a finished job, such as the store's "Send for review": the button
 * turns busy, the record the API answers with reaches the site's lists, and the last step
 * takes the action's done label. A refusal shows on the job and the button comes back.
 */
import { errorMessage } from '../api/api-error';
import { lastStepId, relabelStep } from './upload-steps';
import type { LiveJob } from './live-job.type';
import type { QueueState } from './queue-state';
import type { UploadRunner } from './upload-runner.type';

type FollowUpParams<T, R> = {
  runner: UploadRunner<T, R>;
  live: LiveJob<T>;
  state: QueueState;
  emit: (record: R) => void;
};

const runFollowUp = async <T, R>(params: FollowUpParams<T, R>): Promise<void> => {
  const { runner, live, state, emit } = params;
  const { id, target, resume } = live.record;
  const action = runner.followUp;
  if (!action || !resume) return;
  state.patch(id, { followUp: 'running', error: null });
  try {
    emit(await action.run(target, resume));
    state.patch(id, (job) => ({ followUp: 'done', steps: relabelStep(job.steps, lastStepId(job.steps) ?? '', action.doneLabel) }));
  } catch (error) {
    state.patch(id, { followUp: 'idle', error: errorMessage(error) });
  }
};

export { runFollowUp };
