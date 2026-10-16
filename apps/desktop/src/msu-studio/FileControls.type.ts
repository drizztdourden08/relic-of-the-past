/* @layer renderer-components @kind types */
type FileControlsProps = {
  filter: string;
  coveredCount: number;
  supersededOnly: boolean;
  onFilterChange: (filter: string) => void;
  onSupersededOnlyChange: (checked: boolean) => void;
};

export type { FileControlsProps };
