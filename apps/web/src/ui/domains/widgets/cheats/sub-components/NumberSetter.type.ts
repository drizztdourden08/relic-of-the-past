/* @layer renderer-widgets @kind types */

type NumberSetterProps = {
  title: string;
  value: number;
  min: number;
  max: number;
  /** Amounts the step buttons add or take, smallest first. Absent when `ladder` is given. */
  steps?: readonly number[];
  /** The only values allowed, in order: the buttons walk it and every rung is a chip. */
  ladder?: readonly number[];
  /** How a value reads on the buttons and the chips; digits by default. */
  format?: (value: number) => string;
  anchor: HTMLElement | null;
  onCommit: (value: number) => void;
  onClose: () => void;
};

export type { NumberSetterProps };
