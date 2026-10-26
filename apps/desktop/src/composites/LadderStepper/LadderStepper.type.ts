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
type LadderSize = 'default' | 'compact';

type LadderMediaPlacement = 'above' | 'below';

interface LadderStepperProps {
  label: string;
  steps: readonly LadderStep[];
  size?: LadderSize;
  mediaPlacement?: LadderMediaPlacement;
  showLabels?: boolean;
  className?: string;
}

interface LadderStepMediaProps {
  step: LadderStep;
}

export type { LadderStep, LadderStepMediaProps, LadderStepperProps };
