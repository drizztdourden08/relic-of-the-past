/* @layer renderer-app @kind hook */
import { useBugReportExtras } from '@drizztdourden08/brock-react';
import { useReportContext } from '@app/hooks/useReportContext';
import { reportSnapshotOf } from './report-snapshot-of';

const useReportSnapshotOnOpen = (): void => {
  const { context } = useReportContext();
  useBugReportExtras(() => reportSnapshotOf(context));
};

export { useReportSnapshotOnOpen };
