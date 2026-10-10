/* @layer site-kit @kind logic */
import { formatBytes } from '../format/format-bytes';
import { FILE_STEP } from './upload-steps';
import type { ResolveResumeParams } from './resolve-resume.type';
import type { UploadResume } from './upload-job.type';

const hashDetail = (sha256: string | null, bytes: number) => (sha256 ? `sha-256 · ${formatBytes(bytes)}` : formatBytes(bytes));

const resolveResume = async <T, R>(params: ResolveResumeParams<T, R>): Promise<UploadResume> => {
  const { runner, record, state, file, facts, signal, step, save } = params;
  if (record.resume) return record.resume;
  const { id } = record;
  state.patch(id, { phase: 'hashing' });
  step(FILE_STEP.hash, 'running');
  const sha256 = await runner.hash(file);
  signal.throwIfAborted();
  step(FILE_STEP.hash, 'done', hashDetail(sha256, file.size));
  const resume = await runner.begin(record.target, facts, sha256);
  record.resume = resume;
  record.label = runner.labelOf(record.target, facts, resume.n);
  state.patch(id, { resume, label: record.label });
  await save();
  return resume;
};

export { resolveResume };
