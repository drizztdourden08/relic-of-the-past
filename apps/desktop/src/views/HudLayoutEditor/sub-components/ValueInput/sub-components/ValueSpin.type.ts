/* @layer renderer-components @kind types */
interface ValueSpinProps {
  named: string;
  stepBy: (dir: 1 | -1) => void;
}

export type { ValueSpinProps };
