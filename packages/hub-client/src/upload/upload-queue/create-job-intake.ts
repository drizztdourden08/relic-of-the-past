/* @layer site-kit @kind logic */
import { formatBytes } from '../../format/format-bytes';
import { isSameFile, jobOf, recordOf } from '../job-of';
import { keepFile, saveRecord } from '../upload-records';
import type { JobIntakeParams } from './queue-parts.type';

const createJobIntake = <T, R>(params: JobIntakeParams<T, R>) => {
  const { runner, state, lives, pump } = params;
  const keepCopy = (id: string, file: Blob) => keepFile(id, file).then((kept) => {
    if (kept && lives.has(id)) state.patch(id, { fileKept: true });
  });

  const add = (target: T, file: File | null): string => {
    const record = recordOf(runner, target, file);
    const { id } = record;
    if (file && file.size > runner.maxBytes) {
      state.insert({ ...jobOf(record, 'failed'), error: `Larger than ${formatBytes(runner.maxBytes)}.` });
      return id;
    }
    const stored = Promise.all([saveRecord(record), file ? keepCopy(id, file) : null]);
    lives.set(id, { record, file, controller: null, cancelled: false, stored });
    state.insert(jobOf(record, 'queued'));
    pump();
    return id;
  };

  const start = (files: File[], target: T) => runner.pick(files, target).map((file) => add(target, file));

  const pickFile = (id: string, file: File) => {
    const live = lives.get(id);
    const facts = live?.record.file;
    if (!live || !facts) return;
    if (!isSameFile(facts, file)) {
      state.patch(id, { error: `That is a different file. Pick ${facts.name}.` });
      return;
    }
    live.file = file;
    live.stored = keepCopy(id, file);
    state.patch(id, { phase: 'queued', error: null });
    pump();
  };

  return { add, start, pickFile };
};

export { createJobIntake };
