/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { DialogShell } from '@drizztdourden08/tessera/composites';
import { Box } from '@drizztdourden08/tessera/primitives';
import { useControllerReportForm } from './behavior/useControllerReportForm';
import { useReportDialogControls } from './behavior/useReportDialogControls';
import { buildReportStepLabels, reportStepIndex } from './report-step-labels';
import { ReportActions } from './sub-components/ReportActions';
import { ReportBody } from './sub-components/ReportBody';
import { StepIndicator } from '@drizztdourden08/brock-input/renderer';
import type { ControllerReportDialogProps } from './ControllerReportDialog.type';
import './ControllerReportDialog.css';

const ControllerReportDialog = (props: ControllerReportDialogProps) => {
  const t = useT();
  const { open, onClose, deviceKey } = props;
  const form = useControllerReportForm(deviceKey);
  const controls = useReportDialogControls({ form, onClose });
  const showResult = open && controls.filed !== null;

  return (
    <DialogShell
      open={open}
      onClose={controls.closeForm}
      title={showResult ? t('views-input-tester:dialog.filed') : t('views-input-tester:dialog.title')}
      headerExtra={!showResult && <StepIndicator labels={buildReportStepLabels(form.wizard, t)} current={reportStepIndex(form.step, form.wizard)} />}
      className="controller-report controller-report--wide"
      actions={<ReportActions form={form} controls={controls} />}
    >
      <Box className="controller-report__body">
        <ReportBody form={form} controls={controls} />
      </Box>
    </DialogShell>
  );
};

export { ControllerReportDialog };
