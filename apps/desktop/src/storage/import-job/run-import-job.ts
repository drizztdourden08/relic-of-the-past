/* @layer renderer-lib @kind logic */
import { jobs } from '@drizztdourden08/brock-react';
import { importJobId } from './import-job.constants';
import { importReportOf } from './import-report';
import type { ImportJobParams } from './import-job.type';

const runImportJob = <Result>(params: ImportJobParams<Result>): Promise<Result> => {
  const { kind, title, work, failureOf } = params;
  const job = jobs.start(importJobId(kind), [{ id: kind, label: title }], { title, visible: false, cancellable: false, onDuplicate: 'queue' });
  return job.run(async () => {
    job.step(kind);
    const result = await work(importReportOf(job));
    const failure = failureOf?.(result) ?? null;
    if (failure !== null) job.fail(failure);
    return result;
  });
};

export { runImportJob };
