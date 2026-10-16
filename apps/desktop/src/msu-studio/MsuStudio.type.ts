/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { StudioTab } from './sound-labels';
import type { MsuManagerModel } from './msu-manager.type';

interface MsuStudioProps {
  msu: MsuManagerModel;
  pack: string | null;
  readOnly: boolean;
  origin: ReactNode;
  list: ReactNode;
  tab: StudioTab;
  onTabChange: (tab: StudioTab) => void;
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export type { MsuStudioProps };
