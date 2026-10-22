/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import type { DiagnosticsFlowBodyProps } from './diagnostics-wizard.type';
import { layoutDeviceName } from './behavior/layout-device-name';
import { FlowStep } from './sub-components/FlowStep';
import { LayoutCaptureOverlay } from './sub-components/LayoutCaptureOverlay';
import './DiagnosticsFlowBody.css';

const DiagnosticsFlowBody = (props: DiagnosticsFlowBodyProps) => {
  const { wizard } = props;

  return (
    <Box className="diagnostics-wizard__body">
      <LayoutCaptureOverlay stage={wizard.layoutStage} deviceName={layoutDeviceName(wizard)} />
      <FlowStep {...props} />
    </Box>
  );
};

export { DiagnosticsFlowBody };
