/* @layer site-kit @kind logic */
import { keptParts, runMultipart } from '@rotp/hub-contracts';
import { formatBytes } from '../format/format-bytes';
import { putPart } from './put-part';
import { dropRecord, saveRecord } from './upload-records';
import { createRate } from './upload-rate';
import { formatProgress } from './upload-format';
import { FILE_STEP, setStep, settleSteps } from './upload-steps';
import { PROGRESS_REDRAW_MS } from './run-job.constants';
import type { RunJobParams } from './run-job.type';
import type { StepState, UploadResume } from './upload-job.type';

const hashDetail = (sha256: string | null, bytes: number) => (sha256 ? `sha-256 · ${formatBytes(bytes)}` : formatBytes(bytes));

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
  let resume: UploadResume;
  if (record.resume) {
    resume = record.resume;
  } else {
    state.patch(id, { phase: 'hashing' });
    step(FILE_STEP.hash, 'running');
    const sha256 = await runner.hash(file);
    signal.throwIfAborted();
    step(FILE_STEP.hash, 'done', hashDetail(sha256, bytes));
    resume = await runner.begin(record.target, facts, sha256);
    record.resume = resume;
    record.label = runner.labelOf(record.target, facts, resume.n);
    state.patch(id, { resume, label: record.label });
    await save();
  }
  if (state.job(id)?.steps.find((entry) => entry.id === FILE_STEP.hash)?.state !== 'done') step(FILE_STEP.hash, 'done', formatBytes(bytes));

  const begun = runner.bind(record.target, resume);
  const done = resumed ? keptParts(await begun.listParts(), resume.partSize, bytes, resume.parts) : new Map<number, string>();
  state.patch(id, { phase: 'uploading', resume });
  step(FILE_STEP.upload, 'running');

  const rate = createRate();
  let drawnAt = 0;
  const onProgress = (sent: number) => {
    rate.sample(sent);
    const now = performance.now();
    if (now - drawnAt < PROGRESS_REDRAW_MS && sent < bytes) return;
    drawnAt = now;
    const { bytesPerSecond, msLeft } = rate.estimate(sent, bytes);
    state.patch(id, (job) => ({ sent, bytesPerSecond, msLeft, steps: setStep(job.steps, FILE_STEP.upload, 'running', formatProgress(sent, bytes)) }));
  };
  const onPartsUp = () => state.patch(id, (job) => ({
    phase: 'verifying',
    sent: bytes,
    bytesPerSecond: null,
    msLeft: null,
    steps: setStep(setStep(job.steps, FILE_STEP.upload, 'done', formatBytes(bytes)), FILE_STEP.verify, 'running'),
  }));

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
