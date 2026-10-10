/* @layer site-kit @kind logic */
import { formatBytes } from '../format/format-bytes';
import { createRate } from './upload-rate';
import { formatProgress } from './upload-format';
import { FILE_STEP, setStep } from './upload-steps';
import { PROGRESS_REDRAW_MS } from './run-job.constants';
import type { QueueState } from './queue-state.type';

const createProgressHandlers = (state: QueueState, id: string, bytes: number) => {
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
  return { onProgress, onPartsUp };
};

export { createProgressHandlers };
