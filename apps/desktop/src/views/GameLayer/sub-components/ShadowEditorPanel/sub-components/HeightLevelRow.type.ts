/* @layer renderer-components @kind types */
interface HeightLevelRowProps {
  index: number;
  label: string;
  value: number;
  onUpdate: (index: number, patch: { label?: string; value?: number }) => void;
  onRemove: (index: number) => void;
}

export type { HeightLevelRowProps };
