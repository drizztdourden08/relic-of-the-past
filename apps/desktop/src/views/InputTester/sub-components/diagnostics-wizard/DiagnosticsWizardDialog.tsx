/* @layer renderer-components @kind component */
import { DialogShell } from '@drizztdourden08/tessera/composites';
import { DiagnosticsWizard } from './DiagnosticsWizard';
import type { DiagnosticsWizardDialogProps } from './DiagnosticsWizardDialog.type';
import './DiagnosticsWizardDialog.css';

const DiagnosticsWizardDialog = (props: DiagnosticsWizardDialogProps) => {
  const { open, onClose, onComplete } = props;

  return (
    <DialogShell
      open={open}
      onClose={onClose}
      dismissable={false}
      title="Gamepad diagnostics"
      titleWrap
      className="diagnostics-wizard-dialog"
    >
      {open && <DiagnosticsWizard onClose={onClose} onComplete={onComplete} />}
    </DialogShell>
  );
};

export { DiagnosticsWizardDialog };
