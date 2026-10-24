/* @layer renderer-components @kind component */
import { useCallback, useState } from 'react';
import { Box, EmptyState } from '@drizztdourden08/tessera/primitives';
import { ControllerReportDialog } from '@app/views/InputTester';
import { useControllerPage } from './behavior/useControllerPage';
import { GONE_MESSAGE } from './ControllerPage.constants';
import type { ControllerPageProps } from './ControllerPage.type';
import { AxesBox } from './sub-components/AxesBox';
import { ButtonsBox } from './sub-components/ButtonsBox';
import { InfoBox } from './sub-components/InfoBox';
import { PadActions } from './sub-components/PadActions';
import { PadBox } from './sub-components/PadBox';
import './ControllerPage.css';

const ControllerPage = ({ deviceKey, onRunDiagnostics }: ControllerPageProps) => {
  const page = useControllerPage(deviceKey);
  const [reportKey, setReportKey] = useState<string | null>(null);
  const closeReport = useCallback(() => setReportKey(null), []);

  if (!page) return <EmptyState message={GONE_MESSAGE} />;

  return (
    <Box className="controller-page">
      <PadActions deviceKey={deviceKey} onRunDiagnostics={onRunDiagnostics} onReport={setReportKey} />
      <Box className="controller-page__grid">
        <PadBox page={page} />
        <AxesBox page={page} />
        <ButtonsBox page={page} />
        <InfoBox page={page} />
      </Box>
      {reportKey && <ControllerReportDialog open deviceKey={reportKey} onClose={closeReport} />}
    </Box>
  );
};

export { ControllerPage };
