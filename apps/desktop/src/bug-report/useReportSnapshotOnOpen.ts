/* @layer renderer-app @kind hook */
import { useEffect, useRef } from 'react';
import { useBugReportStore } from '@drizztdourden08/brock-react';
import { useReportContext } from '@app/lib/diagnostics/useReportContext';
import { sendReportSnapshot } from './send-report-snapshot';

const useReportSnapshotOnOpen = (): void => {
  const { context } = useReportContext();
  const contextRef = useRef(context);
  contextRef.current = context;

  useEffect(() => useBugReportStore.subscribe((next, previous) => {
    if (next.open && !previous.open) void sendReportSnapshot(contextRef.current).catch(() => undefined);
  }), []);
};

export { useReportSnapshotOnOpen };
