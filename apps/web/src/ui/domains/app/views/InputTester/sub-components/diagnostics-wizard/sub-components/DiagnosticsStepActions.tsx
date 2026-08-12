/* @layer renderer-components @kind component */
/**
 * The Back/Next pair for the four diagnostic sub-steps whose navigation
 * never differs by host: intro, choose-controller, byte-capture,
 * positional-capture. The fifth, summary, ends the run differently per host
 * (restart-and-loop for the standalone dialog, hand off to the report's own
 * review step for the controller report) and is built by the caller
 * instead of here.
 *
 * `introBack` is the one seam between hosts: the standalone dialog has no
 * earlier step to return to from its own first step, so it leaves this
 * unset and shows no Back there, exactly as before. The controller report
 * has its own steps ahead of this flow and passes a callback that leaves
 * the diagnostic run entirely.
 */
import type { ReactNode } from 'react';
import { Button } from '@ds/primitives';
import type { DiagnosticsWizardState } from '../behavior/useDiagnosticsWizardState';

interface DiagnosticsStepActionsProps {
  wizard: DiagnosticsWizardState;
  cancelAction: ReactNode;
  introBack?: () => void;
  onByteCaptureNext: () => void;
  capturedCount: number;
}

const DiagnosticsStepActions = (props: DiagnosticsStepActionsProps) => {
  const { wizard, cancelAction, introBack, onByteCaptureNext, capturedCount } = props;

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
        <Button variant="primary" onClick={() => { void wizard.confirmChoice(); }} disabled={wizard.deviceKey === null || capturingLayout}>Next</Button>
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
