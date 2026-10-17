/* @layer renderer-app @kind hook */
import { useEffect, useRef } from 'react';
import { bugReport, useBugReportStore } from '@drizztdourden08/brock-react';

const useDefaultReportTitle = (subject: string): void => {
  const open = useBugReportStore((s) => s.open);
  const latest = useRef(subject);
  latest.current = subject;

  useEffect(() => {
    if (open && useBugReportStore.getState().prefill === null) bugReport.setDefaultTitle(latest.current);
  }, [open]);
};

export { useDefaultReportTitle };
