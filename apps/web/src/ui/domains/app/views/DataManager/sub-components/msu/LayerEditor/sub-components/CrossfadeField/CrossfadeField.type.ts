/* @layer renderer-components @kind types */
interface CrossfadeFieldProps {
  seconds: number;
  layerId: string;
  disabled?: boolean;
  onChange: (seconds: number) => void;
}

export type { CrossfadeFieldProps };
