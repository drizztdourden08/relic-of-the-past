/* @layer renderer-components @kind component */
import { Box } from '../../primitives/Box';
import { Text } from '../../primitives/Text';
import { DialogShell } from '../DialogShell';
import type { WizardDialogShellProps } from './WizardDialogShell.type';
import './WizardDialogShell.css';

/**
 * WizardDialogShell — a multi-step modal built on DialogShell. Adds the shared
 * wizard chrome (header row with title + extras, a numbered step indicator) on
 * top of DialogShell's portal/backdrop/escape/actions. The body for the active
 * step is passed as children.
 */
const WizardDialogShell = (props: WizardDialogShellProps) => {
  const { open, onClose, title, headerExtra, steps, activeStep, onStepChange, actions, className = '', children } = props;
  return (
    <DialogShell open={open} onClose={onClose} actions={actions} className={`wizard-dialog${className ? ` ${className}` : ''}`}>
      <Box className="wizard-dialog__header">
        <Text as="h3" className="wizard-dialog__title">{title}</Text>
        {headerExtra}
      </Box>
      <Box className="wizard-dialog__steps">
        {steps.map((s, i) => (
          <Box
            as="button"
            key={s.label}
            className={`wizard-dialog__step${i === activeStep ? ' wizard-dialog__step--active' : ''}`}
            onClick={() => onStepChange(i)}
          >
            {i + 1}. {s.label}
          </Box>
        ))}
      </Box>
      {children}
    </DialogShell>
  );
};

export { WizardDialogShell };
