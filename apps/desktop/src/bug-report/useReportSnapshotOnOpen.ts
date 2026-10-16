/* @layer renderer-app @kind hook */
import { useBugReportExtras } from '@drizztdourden08/brock-react';
import { useReportContext } from '@app/hooks/useReportContext';
import { reportSnapshotOf } from './report-snapshot-of';
import { useDefaultReportTitle } from './useDefaultReportTitle';

const useReportSnapshotOnOpen = (): void => {
  const { context, subject } = useReportContext();
  useBugReportExtras(() => reportSnapshotOf(context));
  useDefaultReportTitle(subject);
};

export { useReportSnapshotOnOpen };
