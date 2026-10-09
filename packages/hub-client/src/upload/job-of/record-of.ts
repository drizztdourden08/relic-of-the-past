/* @layer site-kit @kind logic */
import type { UploadRecord } from '../upload-record.type';
import type { UploadRunner } from '../upload-runner.type';
import { factsOf } from './facts-of';

const recordOf = <T, R>(runner: UploadRunner<T, R>, target: T, file: File | null): UploadRecord<T> => {
  const facts = file ? factsOf(file) : null;
  return {
    id: crypto.randomUUID(),
    site: runner.site,
    label: runner.labelOf(target, facts, null),
    title: runner.titleOf(target, facts),
    target,
    file: facts,
    resume: null,
    steps: runner.stepsOf(target, facts),
    createdAt: Date.now(),
  };
};

export { recordOf };
