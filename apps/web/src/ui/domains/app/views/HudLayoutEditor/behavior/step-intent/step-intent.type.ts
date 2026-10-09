/* @layer renderer-components @kind types */
type StepDirection = 'up' | 'down' | 'out' | 'in';

interface StepOption { direction: StepDirection; label: string; enabled: boolean }

export type { StepDirection, StepOption };
