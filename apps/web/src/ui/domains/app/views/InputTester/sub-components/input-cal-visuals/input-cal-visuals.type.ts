/* @layer renderer-components @kind types */
interface AxisRecordButtonProps {
  getValues: () => number[];
  label: string;
}

interface TriggerBarProps {
  value: number;
  label: string;
  pressed?: boolean;
}

interface StickCircleProps {
  x: number;
  y: number;
  label: string;
  iconPrefix?: string;
}

export type { AxisRecordButtonProps, StickCircleProps, TriggerBarProps };
