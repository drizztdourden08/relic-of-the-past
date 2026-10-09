/* @layer site-kit @kind logic */
import { errorMessage } from '../api/api-error';
import { lastStepId, relabelStep } from './upload-steps';
import type { FollowUpParams } from './run-follow-up.type';

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
