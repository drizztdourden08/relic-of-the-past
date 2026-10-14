/* @layer renderer-components @kind component */
import type { DiagnosticsFlowBodyProps } from '../diagnostics-wizard.type';
import { ByteCaptureFlow } from './ByteCaptureFlow';
import { ChooseControllerStep } from './ChooseControllerStep';
import { IntroStep } from './IntroStep';
import { PositionalCaptureStep } from './PositionalCaptureStep';
import { SummaryStep } from './SummaryStep';

const FlowStep = (props: DiagnosticsFlowBodyProps) => {
  const { wizard } = props;

  if (wizard.step === 'intro') return <IntroStep releaseStatus={wizard.releaseStatus} />;

  if (wizard.step === 'choose-controller') {
    return (
      <ChooseControllerStep
        devices={wizard.chooserDevices}
        addedNames={wizard.addedNames}
        selectedDeviceKey={wizard.deviceKey}
        onSelect={wizard.setDeviceKey}
        selectedEntry={wizard.selectedChooser}
        mapping={wizard.mapping}
        profile={wizard.profile}
      />
    );
  }

  if (wizard.step === 'byte-capture') return <ByteCaptureFlow {...props} />;

  if (wizard.step === 'positional-capture') {
    return (
      <PositionalCaptureStep
        restoreStatus={wizard.restoreStatus}
        deviceKey={wizard.deviceKey}
        resolvedDevice={wizard.resolvedDevice}
        onRecordsChange={wizard.handleRecordsChange}
      />
    );
  }

  return (
    <SummaryStep
      byteCapture={wizard.byteCapture}
      hasByteCapability={wizard.hasByteCapability}
      positionalRecords={wizard.positionalRecords}
    />
  );
};

export { FlowStep };
