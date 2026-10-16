/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

type SoundPanelControlsProps = {
  tabs: ReactNode;
  unreachableCount: number;
  filter: string;
  showUnreachable: boolean;
  onFilterChange: (filter: string) => void;
  onShowUnreachableChange: (show: boolean) => void;
};

export type { SoundPanelControlsProps };
