/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { I18n } from '@drizztdourden08/brock-core/i18n';

type SoundToolGroupsProps = {
  t: I18n['t'];
  tabs: ReactNode;
  unreachableCount: number;
  filter: string;
  showUnreachable: boolean;
  onFilterChange: (filter: string) => void;
  onShowUnreachableChange: (show: boolean) => void;
};

export type { SoundToolGroupsProps };
