/* @layer renderer-components @kind types */
interface LadderStep {
  key: string;
  label: string;
  sprite?: string | undefined;
  value?: string | undefined;
  active: boolean;
  struck?: boolean | undefined;
  onToggle?: (() => void) | undefined;
}

interface LadderStepperProps {
  label: string;
  steps: readonly LadderStep[];
  className?: string;
}

export type { LadderStep, LadderStepperProps };
