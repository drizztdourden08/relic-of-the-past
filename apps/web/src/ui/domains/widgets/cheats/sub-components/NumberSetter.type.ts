/* @layer renderer-widgets @kind types */
type NumberSetterProps = {
  title: string;
  value: number;
  min: number;
  max: number;
  steps?: readonly number[];
  ladder?: readonly number[];
  format?: (value: number) => string;
  anchor: HTMLElement | null;
  onCommit: (value: number) => void;
  onClose: () => void;
};

export type { NumberSetterProps };
