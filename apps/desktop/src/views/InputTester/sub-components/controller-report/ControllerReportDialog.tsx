/* @layer renderer-components @kind component */
import { WizardDialog, DialogShell } from '@drizztdourden08/tessera/composites';
import { Box } from '@drizztdourden08/tessera/primitives';
import { useControllerReportForm } from './behavior/useControllerReportForm';
import { useReportDialogControls } from './behavior/useReportDialogControls';
import { useControllerReportWizard } from './behavior/useControllerReportWizard';
import { COPY_LABELS } from '../diagnostics-wizard/diagnostics-wizard.constants';
import { FlashButton } from '../diagnostics-wizard/sub-components/FlashButton';
import { ReportActions } from './sub-components/ReportActions';
import { ReportBody } from './sub-components/ReportBody';
import type { ControllerReportDialogProps } from './ControllerReportDialog.type';
import './ControllerReportDialog.css';

const ControllerReportDialog = (props: ControllerReportDialogProps) => {
  const { open, onClose, deviceKey } = props;
  const form = useControllerReportForm(deviceKey);
  const controls = useReportDialogControls({ form, onClose });
  const showResult = open && controls.filed !== null;
  const tesseraWizard = useControllerReportWizard({ form, controls });
  const summaryActions = (
    <Box className="diagnostics-wizard__summary-actions">
      <FlashButton status={controls.copyStatus} onClick={controls.handleCopy} labels={COPY_LABELS} />
    </Box>
  );

  if (tesseraWizard === null) return null;

  if (showResult) {
    return (
      <DialogShell
        open
        onClose={controls.closeForm}
        title="Report filed"
        className="controller-report controller-report--wide"
        actions={<ReportActions form={form} controls={controls} />}
      >
        <Box className="controller-report__body"><ReportBody form={form} controls={controls} /></Box>
      </DialogShell>
    );
  }

  return (
    <WizardDialog
      wizard={tesseraWizard}
      open={open}
      title="Report a controller as not working"
      onExit={controls.closeForm}
      className="controller-report__wizard"
    >
      <ReportBody form={form} controls={controls} summaryActions={summaryActions} />
    </WizardDialog>
  );
};

export { ControllerReportDialog };
