/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Button } from '@drizztdourden08/tessera/primitives';
import type { DiagnosticsStepActionsProps } from './diagnostics-steps.type';

const DiagnosticsStepActions = (props: DiagnosticsStepActionsProps) => {
  const { wizard, cancelAction, introBack, onByteCaptureNext, capturedCount } = props;
  const { confirmChoice } = wizard;
  const handleConfirm = useCallback(() => { void confirmChoice(); }, [confirmChoice]);

  if (wizard.step === 'intro') {
    return (
      <>
        {cancelAction}
        {introBack && <Button variant="secondary" onClick={introBack}>Back</Button>}
        <Button variant="primary" onClick={wizard.goNext} disabled={wizard.releaseStatus !== 'done'}>Next</Button>
      </>
    );
  }

  if (wizard.step === 'choose-controller') {
    const capturingLayout = wizard.layoutStage === 'starting' || wizard.layoutStage === 'fetching' || wizard.layoutStage === 'stopping';
    return (
      <>
        {cancelAction}
        <Button variant="secondary" onClick={wizard.goBack}>Back</Button>
        <Button variant="primary" onClick={handleConfirm} disabled={wizard.deviceKey === null || capturingLayout}>Next</Button>
      </>
    );
  }

  if (wizard.step === 'byte-capture') {
    return (
      <>
        {cancelAction}
        <Button variant="secondary" onClick={wizard.goBack}>Back</Button>
        <Button variant="primary" onClick={onByteCaptureNext} disabled={capturedCount === 0}>Next</Button>
      </>
    );
  }

  if (wizard.step === 'positional-capture') {
    return (
      <>
        {cancelAction}
        <Button variant="secondary" onClick={wizard.goBack} disabled={wizard.restoreStatus !== 'done'}>Back</Button>
        <Button variant="primary" onClick={wizard.goNext} disabled={wizard.restoreStatus !== 'done'}>Next</Button>
      </>
    );
  }

  return null;
};

export { DiagnosticsStepActions };
export type { DiagnosticsStepActionsProps };
