/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface WizardStep {
  /** Step label shown after its 1-based number (e.g. "Fields" → "1. Fields"). */
  label: string;
}

interface WizardDialogShellProps {
  open: boolean;
  onClose: () => void;
  /** Heading text shown at the left of the header row. */
  title: string;
  /** Optional trailing header content (ids, status badges), right-aligned. */
  headerExtra?: ReactNode;
  /** Ordered step tabs. */
  steps: WizardStep[];
  /** Index of the active step. */
  activeStep: number;
  onStepChange: (index: number) => void;
  /** Footer action row (buttons). */
  actions?: ReactNode;
  /** Extra modifier class for the panel. */
  className?: string;
  children?: ReactNode;
}

export type { WizardStep, WizardDialogShellProps };
