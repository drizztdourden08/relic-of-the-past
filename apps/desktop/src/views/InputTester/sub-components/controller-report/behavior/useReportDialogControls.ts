/* @layer renderer-components @kind hook */
import { useCallback, useRef, useState } from 'react';
import type { HidWizardHandle } from '../../HidCalibrationWizard';
import { useSummaryExport } from '../../diagnostics-wizard/behavior/useSummaryExport';
import { useFlashStatus } from '../../hid-calibration/hooks/useFlashStatus';
import type { UseReportDialogControlsParams } from '../report-dialog-controls.type';

const useReportDialogControls = (params: UseReportDialogControlsParams) => {
  const { form, onClose } = params;
  const wizardRef = useRef<HidWizardHandle>(null);
  const [capturedCount, setCapturedCount] = useState(0);
  const { handleCopyJson } = useSummaryExport(form.wizard.byteCapture, form.wizard.positionalRecords);
  const [copyStatus, flashCopy] = useFlashStatus();
  const filed = form.status === 'done' ? form.filed : null;
  const { reset, goToStep, wizard } = form;
  const { goNext } = wizard;

  const closeForm = useCallback(() => {
    onClose();
    reset();
  }, [onClose, reset]);

  const openAndClose = useCallback((url: string) => {
    window.open(url, '_blank');
    closeForm();
  }, [closeForm]);

  const handleByteCaptureNext = useCallback(() => {
    wizardRef.current?.finish();
    goNext();
  }, [goNext]);

  const handleCopy = useCallback(() => handleCopyJson().then(flashCopy), [handleCopyJson, flashCopy]);
  const goAbout = useCallback(() => goToStep('about'), [goToStep]);
  const goUserInfo = useCallback(() => goToStep('user-info'), [goToStep]);
  const goDiagnostics = useCallback(() => goToStep('diagnostics'), [goToStep]);
  const sanctuaryUrl = filed?.sanctuaryUrl;
  const issueUrl = filed?.issueUrl;
  const openSanctuary = useCallback(() => { if (sanctuaryUrl) openAndClose(sanctuaryUrl); }, [openAndClose, sanctuaryUrl]);
  const openIssue = useCallback(() => { if (issueUrl) openAndClose(issueUrl); }, [openAndClose, issueUrl]);

  return {
    wizardRef, capturedCount, setCapturedCount, copyStatus, handleCopy, filed,
    closeForm, handleByteCaptureNext, goAbout, goUserInfo, goDiagnostics, openSanctuary, openIssue,
  };
};

export { useReportDialogControls };
