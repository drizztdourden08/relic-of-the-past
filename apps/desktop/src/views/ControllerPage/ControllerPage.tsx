/* @layer renderer-components @kind component */
import { useCallback, useState } from 'react';
import { Box, EmptyState } from '@drizztdourden08/tessera/primitives';
import { ControllerReportDialog } from '@app/views/InputTester/sub-components/controller-report';
import { useControllerPage } from './behavior/useControllerPage';
import type { ControllerPageProps } from './ControllerPage.type';
import { AxesBox } from './sub-components/AxesBox';
import { ButtonsBox } from './sub-components/ButtonsBox';
import { InfoBox } from './sub-components/InfoBox';
import { PadBox } from './sub-components/PadBox';
import { PageHead } from './sub-components/PageHead';
import './ControllerPage.css';

const ControllerPage = ({ deviceKey, gone, onRunDiagnostics }: ControllerPageProps) => {
  const page = useControllerPage(deviceKey);
  const [reportKey, setReportKey] = useState<string | null>(null);
  const closeReport = useCallback(() => setReportKey(null), []);

  if (!page) return <EmptyState title="Controller disconnected" message="Plug the controller back in to see its live input." />;

  return (
    <Box className="controller-page" data-gone={gone ? '' : undefined}>
      <PageHead page={page} onRunDiagnostics={onRunDiagnostics} onReport={setReportKey} />
      <PadBox page={page} />
      <AxesBox page={page} />
      <ButtonsBox page={page} />
      <InfoBox page={page} />
      {reportKey && <ControllerReportDialog open deviceKey={reportKey} onClose={closeReport} />}
    </Box>
  );
};

export { ControllerPage };
