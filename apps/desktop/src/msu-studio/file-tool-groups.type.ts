/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

type FileToolGroupsProps = {
  tabs: ReactNode;
  filter: string;
  coveredCount: number;
  supersededOnly: boolean;
  onFilterChange: (filter: string) => void;
  onSupersededOnlyChange: (checked: boolean) => void;
};

export type { FileToolGroupsProps };
