/* @layer site-kit @kind logic */
import { keptParts, runMultipart } from '@rotp/hub-contracts';
import { formatBytes } from '../format/format-bytes';
import { createProgressHandlers } from './progress-handlers';
import { putPart } from './put-part';
import { resolveResume } from './resolve-resume';
import { dropRecord, saveRecord } from './upload-records';
import { FILE_STEP, setStep, settleSteps } from './upload-steps';
import type { RunJobParams } from './run-job.type';
import type { StepState } from './upload-job.type';

const runJob = async <T, R>(params: RunJobParams<T, R>): Promise<void> => {
  const { runner, live, state, emit, signal } = params;
  const { record } = live;
  const { id } = record;
  const step = (stepId: string, stepState: StepState, detail?: string | null) =>
    state.patch(id, (job) => ({ steps: setStep(job.steps, stepId, stepState, detail) }));
  const save = () => saveRecord({ ...record, steps: state.job(id)?.steps ?? record.steps });
  const drop = async () => {
    await live.stored;
    await dropRecord(id);
  };

  state.patch(id, { error: null });
  if (runner.prepare) {
    state.patch(id, { phase: 'uploading' });
    const saveTarget = async (target: T) => {
      record.target = target;
      await save();
    };
    record.target = await runner.prepare({ target: record.target, save: saveTarget, step, emit, signal });
  }

  const { file } = live;
  const facts = record.file;
  if (!file || !facts) {
    state.patch(id, (job) => ({ phase: 'done', steps: settleSteps(job.steps) }));
    await drop();
    return;
  }
  const bytes = file.size;

  const resumed = record.resume !== null;
  const resume = await resolveResume({ runner, record, state, file, facts, signal, step, save });
  if (state.job(id)?.steps.find((entry) => entry.id === FILE_STEP.hash)?.state !== 'done') step(FILE_STEP.hash, 'done', formatBytes(bytes));

  const begun = runner.bind(record.target, resume);
  const done = resumed ? keptParts(await begun.listParts(), resume.partSize, bytes, resume.parts) : new Map<number, string>();
  state.patch(id, { phase: 'uploading', resume });
  step(FILE_STEP.upload, 'running');

  const { onProgress, onPartsUp } = createProgressHandlers(state, id, bytes);
  const result = await runMultipart({
    source: file,
    begun,
    done,
    put: (url, blob, onPart) => putPart({ url, blob, onProgress: onPart, signal }),
    onProgress,
    onPartsUp,
    signal,
  });
  emit(result);
  state.patch(id, (job) => ({
    phase: 'done',
    sent: bytes,
    steps: settleSteps(job.steps),
    followUp: runner.followUp ? 'idle' : null,
  }));
  await drop();
};

export { runJob };
export type { RunJobParams } from './run-job.type';
