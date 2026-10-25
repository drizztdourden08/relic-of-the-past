/* @layer renderer-app @kind component */
import type { ReactNode } from 'react';
import { ControllerReportDialog } from '@app/views/InputTester';
import { useControllerReportStore } from './useControllerReportStore';

const ControllerReportHost = ({ children }: { children: ReactNode }) => {
  const deviceKey = useControllerReportStore((state) => state.deviceKey);
  const close = useControllerReportStore((state) => state.close);

  return (
    <>
      {children}
      {deviceKey && <ControllerReportDialog open deviceKey={deviceKey} onClose={close} />}
    </>
  );
};

export { ControllerReportHost };
