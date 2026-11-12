/* @layer shared-input @kind types */

interface StickAxis {
  axisIndex: number;
  direction: '+' | '-';
  label: string;
}

export type { StickAxis };
